import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Flashcard } from '../../flashcard/entities/flashcard.entity';
import { FlashcardAccessType } from '../enums/flashcard-access-type.enum';

@Entity('flashcard_sets')
export class FlashcardSet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: FlashcardAccessType, default: FlashcardAccessType.PRIVATE })
  accessType: FlashcardAccessType;

  @Column({ nullable: true })
  accessPassword?: string; // hash

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Flashcard, (flashcard) => flashcard.flashcardSet, { 
    cascade: true,
    onDelete: 'CASCADE'
  })
  flashcards: Flashcard[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}