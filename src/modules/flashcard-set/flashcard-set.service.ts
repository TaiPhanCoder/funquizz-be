import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { FlashcardSetRepository } from './flashcard-set.repository';
import { CreateFlashcardSetDto } from './dto/request/create-flashcard-set.dto';
import { UpdateFlashcardSetDto } from './dto/request/update-flashcard-set.dto';
import { FlashcardSet } from './entities/flashcard-set.entity';
import { AccessControlService } from './services/access-control.service';
import { FlashcardAccessType } from './enums/flashcard-access-type.enum';

@Injectable()
export class FlashcardSetService {
  constructor(private readonly repo: FlashcardSetRepository, private readonly accessControl: AccessControlService) {}

  async create(dto: CreateFlashcardSetDto, userId: string): Promise<FlashcardSet> {
    const payload: any = { ...dto };
    if (dto.accessType === FlashcardAccessType.SETPASS) {
      if (!dto.accessPassword) throw new BadRequestException('accessPassword is required for SETPASS');
      payload.accessPassword = await this.accessControl.hashPassword(dto.accessPassword);
    } else {
      payload.accessPassword = null;
    }
    return this.repo.create(payload, userId);
  }

  findAllByUser(userId: string): Promise<FlashcardSet[]> {
    return this.repo.findAllByUser(userId);
  }

  async findById(id: string): Promise<FlashcardSet> {
    const set = await this.repo.findById(id);
    if (!set) throw new NotFoundException('Flashcard set not found');
    return set;
  }

  async findAccessibleById(id: string, userId?: string): Promise<FlashcardSet> {
    const set = await this.repo.findByIdForAccess(id, userId);
    if (!set) throw new NotFoundException('Flashcard set not found or access denied');
    return set;
  }

  async update(id: string, dto: UpdateFlashcardSetDto, userId: string): Promise<FlashcardSet> {
    const payload: any = { ...dto };

    if (dto.accessType) {
      if (dto.accessType === FlashcardAccessType.SETPASS) {
        if (!dto.accessPassword) throw new BadRequestException('accessPassword is required for SETPASS');
        payload.accessPassword = await this.accessControl.hashPassword(dto.accessPassword);
      } else {
        payload.accessPassword = null;
      }
    } else if (dto.accessPassword) {
      // If only password provided without changing accessType, hash it
      payload.accessPassword = await this.accessControl.hashPassword(dto.accessPassword);
    }

    return this.repo.update(id, payload, userId);
  }

  remove(id: string, userId: string): Promise<void> {
    return this.repo.remove(id, userId);
  }
}