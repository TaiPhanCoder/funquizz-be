import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RedisService } from '../../../common/services/redis.service';

@Injectable()
export class AccessControlService {
  private readonly UNLOCK_TTL = 86400; // 24 hours
  private readonly UNLOCK_KEY_PREFIX = 'flashcard_set_unlocked';

  constructor(private readonly redisService: RedisService) {}

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async unlockSetForUser(setId: string, userId: string): Promise<void> {
    const key = `${this.UNLOCK_KEY_PREFIX}:${setId}:${userId}`;
    await this.redisService.set(key, 'unlocked', this.UNLOCK_TTL);
  }

  async isSetUnlockedForUser(setId: string, userId: string): Promise<boolean> {
    const key = `${this.UNLOCK_KEY_PREFIX}:${setId}:${userId}`;
    return await this.redisService.exists(key);
  }

  async lockSetForUser(setId: string, userId: string): Promise<void> {
    const key = `${this.UNLOCK_KEY_PREFIX}:${setId}:${userId}`;
    await this.redisService.del(key);
  }
}