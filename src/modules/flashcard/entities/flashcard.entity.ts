import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { FlashcardSet } from '../../flashcard-set/entities/flashcard-set.entity';
import { FlashcardDifficulty } from '../enums/flashcard-difficulty.enum';

@Entity('flashcards')
export class Flashcard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  question: string;

  @Column()
  answer: string;

  @Column({ nullable: true })
  difficulty: FlashcardDifficulty;

  @Column({ default: 0 })
  reviewCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastReviewedAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  flashcardSetId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => FlashcardSet, (flashcardSet) => flashcardSet.flashcards)
  @JoinColumn({ name: 'flashcardSetId' })
  flashcardSet: FlashcardSet;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}