import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ForbiddenException } from '@nestjs/common';
import { FlashcardService } from './flashcard.service';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { UpdateFlashcardDto } from './dto/update-flashcard.dto';
import { FlashcardResponseDto } from './dto/response/flashcard-response.dto';
import { MessageResponseDto } from './dto/response/message-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
// import { FlashcardAccessGuard } from './guards/flashcard-access.guard';
import { FlashcardDifficulty } from './enums/flashcard-difficulty.enum';
import { FlashcardSetService } from '../flashcard-set/flashcard-set.service';
import { FlashcardAccessType } from '../flashcard-set/enums/flashcard-access-type.enum';
import { AccessControlService } from '../flashcard-set/services/access-control.service';

@ApiTags('flashcards')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FlashcardController {
  constructor(
    private readonly flashcardService: FlashcardService,
    private readonly flashcardSetService: FlashcardSetService,
    private readonly accessService: AccessControlService,
  ) {}

  @Post('sets/:setId/flashcards')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new flashcard in a set' })
  @ApiResponse({
    status: 201,
    description: 'Flashcard created successfully',
    type: FlashcardResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Param('setId') setId: string,
    @Body() createFlashcardDto: CreateFlashcardDto,
    @Request() req,
  ): Promise<FlashcardResponseDto> {
    const flashcard = await this.flashcardService.create(createFlashcardDto, req.user.sub, setId);
    return this.mapToResponseDto(flashcard);
  }

  @Get('flashcards')
  @ApiOperation({ summary: 'Get all flashcards for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Flashcards retrieved successfully',
    type: [FlashcardResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Request() req): Promise<FlashcardResponseDto[]> {
    const flashcards = await this.flashcardService.findAll(req.user.sub);
    return flashcards.map(flashcard => this.mapToResponseDto(flashcard));
  }

  @Get('flashcards/difficulty/:difficulty')
  @ApiOperation({ summary: 'Get flashcards by difficulty' })
  @ApiResponse({
    status: 200,
    description: 'Flashcards retrieved successfully',
    type: [FlashcardResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByDifficulty(
    @Param('difficulty') difficulty: string,
    @Request() req,
  ): Promise<FlashcardResponseDto[]> {
    const flashcards = await this.flashcardService.findByDifficulty(difficulty as FlashcardDifficulty, req.user.sub);
    return flashcards.map(flashcard => this.mapToResponseDto(flashcard));
  }

  @Get('flashcards/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get flashcard by ID (checks set access rules)' })
  @ApiResponse({
    status: 200,
    description: 'Flashcard retrieved successfully',
    type: FlashcardResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden (locked set or not owner)' })
  @ApiResponse({ status: 404, description: 'Flashcard not found' })
  async findOne(
    @Param('id') id: string,
    @Request() req,
  ): Promise<FlashcardResponseDto> {
    const flashcard = await this.flashcardService.findAccessibleById(id, req.user?.sub);
    if (!flashcard) {
      throw new ForbiddenException('Access denied');
    }
    // Fetch set to check access type and ownership
    const set = await this.flashcardSetService.findAccessibleById(flashcard.flashcardSetId, req.user.sub);
    if (set.accessType === FlashcardAccessType.PRIVATE && set.userId !== req.user.sub) {
      throw new ForbiddenException('You do not have access to this flashcard');
    }
    if (set.accessType === FlashcardAccessType.SETPASS && set.userId !== req.user.sub) {
      const unlocked = await this.accessService.isSetUnlockedForUser(set.id, req.user.sub);
      if (!unlocked) throw new ForbiddenException('Set is locked. Please unlock first.');
    }
    return this.mapToResponseDto(flashcard);
  }

  @Patch('flashcards/:id')
  @ApiOperation({ summary: 'Update flashcard' })
  @ApiResponse({
    status: 200,
    description: 'Flashcard updated successfully',
    type: FlashcardResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Flashcard not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param('id') id: string,
    @Body() updateFlashcardDto: UpdateFlashcardDto,
    @Request() req,
  ): Promise<FlashcardResponseDto> {
    const flashcard = await this.flashcardService.update(id, updateFlashcardDto, req.user.sub);
    return this.mapToResponseDto(flashcard);
  }

  @Delete('flashcards/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete flashcard' })
  @ApiResponse({
    status: 200,
    description: 'Flashcard deleted successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Flashcard not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(
    @Param('id') id: string,
    @Request() req,
  ): Promise<MessageResponseDto> {
    await this.flashcardService.remove(id, req.user.sub);
    return { message: 'Flashcard deleted successfully' };
  }

  @Post('flashcards/:id/review')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark flashcard as reviewed' })
  @ApiResponse({
    status: 200,
    description: 'Flashcard reviewed successfully',
    type: FlashcardResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Flashcard not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async reviewFlashcard(
    @Param('id') id: string,
    @Request() req,
  ): Promise<FlashcardResponseDto> {
    const flashcard = await this.flashcardService.reviewFlashcard(id, req.user.sub);
    return this.mapToResponseDto(flashcard);
  }

  private mapToResponseDto(flashcard: any): FlashcardResponseDto {
    return {
      id: flashcard.id,
      question: flashcard.question,
      answer: flashcard.answer,
      difficulty: flashcard.difficulty,
      reviewCount: flashcard.reviewCount,
      lastReviewedAt: flashcard.lastReviewedAt,
      isActive: flashcard.isActive,
      imageUrl: flashcard.imageUrl,
      userId: flashcard.userId,
      flashcardSetId: flashcard.flashcardSetId,
      createdAt: flashcard.createdAt,
      updatedAt: flashcard.updatedAt,
    };
  }
}