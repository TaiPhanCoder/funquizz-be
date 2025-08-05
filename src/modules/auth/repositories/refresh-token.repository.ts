import { Injectable } from '@nestjs/common';
import { RedisService } from '../../../common/services/redis.service';

@Injectable()
export class RefreshTokenRepository {
  constructor(private readonly redisService: RedisService) {}

  async create(userId: string, refreshToken: string, expiresIn: number): Promise<void> {
    const key = `refresh_token:${userId}`;
    await this.redisService.set(key, refreshToken, expiresIn);
  }

  async findByUserId(userId: string): Promise<string | null> {
    const key = `refresh_token:${userId}`;
    return await this.redisService.get(key);
  }

  async delete(userId: string): Promise<void> {
    const key = `refresh_token:${userId}`;
    await this.redisService.del(key);
  }

  async deleteByToken(refreshToken: string): Promise<void> {
    // Find all refresh token keys and delete the matching one
    const keys = await this.redisService.keys('refresh_token:*');
    for (const key of keys) {
      const token = await this.redisService.get(key);
      if (token === refreshToken) {
        await this.redisService.del(key);
        break;
      }
    }
  }
}