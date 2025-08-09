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
    return this.flashcardService.create(createFlashcardDto, req.user.sub);
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
    return this.flashcardService.findAll(req.user.sub);
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
    return this.flashcardService.findByCategory(category, req.user.sub);
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
    @Param('difficulty') difficulty: FlashcardDifficulty,
    @Request() req,
  ): Promise<FlashcardResponseDto[]> {
    return this.flashcardService.findByDifficulty(difficulty, req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get flashcard by ID' })
  @ApiResponse({
    status: 200,
    description: 'Flashcard retrieved successfully',
    type: FlashcardResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Flashcard not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(
    @Param('id') id: string,
    @Request() req,
  ): Promise<FlashcardResponseDto> {
    return this.flashcardService.findOne(id, req.user.sub);
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
    return this.flashcardService.update(id, updateFlashcardDto, req.user.sub);
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
    return this.flashcardService.reviewFlashcard(id, req.user.sub);
  }
}