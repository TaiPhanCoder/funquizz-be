import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('otps')
export class Otp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: false })
  email: string;

  @Column()
  code: string;

  @Column({
    type: 'enum',
    enum: ['email_verification', 'password_reset'],
    default: 'email_verification',
  })
  type: string;

  @Column({ default: false })
  isUsed: boolean;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}