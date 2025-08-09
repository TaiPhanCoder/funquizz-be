import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FlashcardSetService } from './flashcard-set.service';
import { CreateFlashcardSetDto } from './dto/request/create-flashcard-set.dto';
import { UpdateFlashcardSetDto } from './dto/request/update-flashcard-set.dto';
import { FlashcardSetResponseDto } from './dto/response/flashcard-set-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@ApiTags('flashcard-sets')
@Controller('sets')
export class FlashcardSetController {
  constructor(private readonly service: FlashcardSetService) {}

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
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get flashcard set by id (public or owned)' })
  @ApiResponse({ status: 200, type: FlashcardSetResponseDto })
  async findOne(@Param('id') id: string, @Request() req): Promise<FlashcardSetResponseDto> {
    const set = await this.service.findAccessibleById(id, req.user?.sub);
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

  private map = (set: any): FlashcardSetResponseDto => ({
    id: set.id,
    name: set.name,
    description: set.description,
    isPublic: set.isPublic,
    userId: set.userId,
    createdAt: set.createdAt,
    updatedAt: set.updatedAt,
  });
}