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
  category: string;

  @Column({ nullable: true })
  difficulty: FlashcardDifficulty;

  @Column({ default: 0 })
  reviewCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastReviewedAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isPublic: boolean;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}