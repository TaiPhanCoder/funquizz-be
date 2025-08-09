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
import { FlashcardService } from './flashcard.service';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { UpdateFlashcardDto } from './dto/update-flashcard.dto';
import { FlashcardResponseDto } from './dto/response/flashcard-response.dto';
import { MessageResponseDto } from './dto/response/message-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { FlashcardAccessGuard } from './guards/flashcard-access.guard';
import { FlashcardDifficulty } from './enums/flashcard-difficulty.enum';

@ApiTags('flashcards')
@Controller('flashcards')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FlashcardController {
  constructor(private readonly flashcardService: FlashcardService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new flashcard' })
  @ApiResponse({
    status: 201,
    description: 'Flashcard created successfully',
    type: FlashcardResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() createFlashcardDto: CreateFlashcardDto,
    @Request() req,
  ): Promise<FlashcardResponseDto> {
    const flashcard = await this.flashcardService.create(createFlashcardDto, req.user.sub);
    return this.mapToResponseDto(flashcard);
  }

  @Get()
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

  @Get('category/:category')
  @ApiOperation({ summary: 'Get flashcards by category' })
  @ApiResponse({
    status: 200,
    description: 'Flashcards retrieved successfully',
    type: [FlashcardResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByCategory(
    @Param('category') category: string,
    @Request() req,
  ): Promise<FlashcardResponseDto[]> {
    const flashcards = await this.flashcardService.findByCategory(category, req.user.sub);
    return flashcards.map(flashcard => this.mapToResponseDto(flashcard));
  }

  @Get('difficulty/:difficulty')
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

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard, FlashcardAccessGuard)
  @ApiOperation({ summary: 'Get flashcard by ID (public or owned)' })
  @ApiResponse({
    status: 200,
    description: 'Flashcard retrieved successfully',
    type: FlashcardResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Flashcard not found or access denied' })
  async findOne(
    @Param('id') id: string,
    @Request() req,
  ): Promise<FlashcardResponseDto> {
    // Flashcard is already validated and attached by FlashcardAccessGuard
    return this.mapToResponseDto(req.flashcard);
  }

  @Patch(':id')
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

  @Delete(':id')
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

  @Post(':id/review')
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
      category: flashcard.category,
      difficulty: flashcard.difficulty,
      reviewCount: flashcard.reviewCount,
      lastReviewedAt: flashcard.lastReviewedAt,
      isActive: flashcard.isActive,
      isPublic: flashcard.isPublic,
      imageUrl: flashcard.imageUrl,
      userId: flashcard.userId,
      createdAt: flashcard.createdAt,
      updatedAt: flashcard.updatedAt,
    };
  }
}