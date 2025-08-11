import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards, Request, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FlashcardSetService } from './flashcard-set.service';
import { CreateFlashcardSetDto } from './dto/request/create-flashcard-set.dto';
import { UpdateFlashcardSetDto } from './dto/request/update-flashcard-set.dto';
import { FlashcardSetResponseDto } from './dto/response/flashcard-set-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { FlashcardAccessType } from './enums/flashcard-access-type.enum';
import { AccessControlService } from './services/access-control.service';
import { UnlockSetDto } from './dto/request/unlock-set.dto';

@ApiTags('flashcard-sets')
@Controller('sets')
export class FlashcardSetController {
  constructor(private readonly service: FlashcardSetService, private readonly accessService: AccessControlService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new flashcard set' })
  @ApiResponse({ status: 201, description: 'Flashcard set created successfully', type: FlashcardSetResponseDto })
  async create(@Body() dto: CreateFlashcardSetDto, @Request() req): Promise<FlashcardSetResponseDto> {
    const set = await this.service.create(dto, req.user.sub);
    return this.map(set);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all flashcard sets of current user' })
  @ApiResponse({ status: 200, type: [FlashcardSetResponseDto] })
  async findAll(@Request() req): Promise<FlashcardSetResponseDto[]> {
    const sets = await this.service.findAllByUser(req.user.sub);
    return sets.map(this.map);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get flashcard set by id with access rules' })
  @ApiResponse({ status: 200, type: FlashcardSetResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden (locked set or not owner)' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  async findOne(@Param('id') id: string, @Request() req): Promise<FlashcardSetResponseDto> {
    const set = await this.service.findById(id);
    // PUBLIC -> allow for any auth user
    // PRIVATE -> must be owner
    // SETPASS -> must be unlocked in Redis
    if (set.accessType === FlashcardAccessType.PRIVATE && set.userId !== req.user.sub) {
      throw new ForbiddenException('You do not have access to this set');
    }
    if (set.accessType === FlashcardAccessType.SETPASS && set.userId !== req.user.sub) {
      const unlocked = await this.accessService.isSetUnlockedForUser(id, req.user.sub);
      if (!unlocked) throw new ForbiddenException('Set is locked. Please unlock first.');
    }
    return this.map(set);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update flashcard set' })
  @ApiResponse({ status: 200, type: FlashcardSetResponseDto })
  async update(@Param('id') id: string, @Body() dto: UpdateFlashcardSetDto, @Request() req): Promise<FlashcardSetResponseDto> {
    const set = await this.service.update(id, dto, req.user.sub);
    return this.map(set);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete flashcard set' })
  @ApiResponse({ status: 200 })
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @Request() req): Promise<{ message: string }> {
    await this.service.remove(id, req.user.sub);
    return { message: 'Flashcard set deleted successfully' };
  }

  @Post(':id/unlock')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unlock a password-protected flashcard set' })
  @ApiResponse({ status: 200, description: 'Unlocked successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden (wrong password or not SETPASS)' })
  async unlock(@Param('id') id: string, @Body() dto: UnlockSetDto, @Request() req): Promise<{ message: string }> {
    const set = await this.service.findAccessibleById(id, req.user?.sub);
    if (set.accessType !== FlashcardAccessType.SETPASS) {
      throw new ForbiddenException('This set does not require a password');
    }
    if (set.userId === req.user.sub) {
      // Owner always has access, no need to unlock
      return { message: 'Owner has full access' };
    }
    if (!set.accessPassword) {
      throw new NotFoundException('Password not set for this set');
    }
    const match = await this.accessService.comparePassword(dto.password, set.accessPassword);
    if (!match) {
      throw new ForbiddenException('Invalid password');
    }
    await this.accessService.unlockSetForUser(id, req.user.sub);
    return { message: 'Unlocked successfully' };
  }
  private map = (set: any): FlashcardSetResponseDto => ({
    id: set.id,
    name: set.name,
    description: set.description,
    accessType: set.accessType,
    userId: set.userId,
    createdAt: set.createdAt,
    updatedAt: set.updatedAt,
  });
}