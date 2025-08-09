import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { FlashcardModule } from './modules/flashcard/flashcard.module';
import { FlashcardSetModule } from './modules/flashcard-set/flashcard-set.module';
import { TypeOrmConfigModule } from './config/typeorm.config';
import { ThrottlerConfigModule } from './config/throttler.config';
import { RedisModule } from './config/redis.module';
import databaseConfig from './config/database.config';
import appConfig from './config/app.config';
import redisConfig from './config/redis.config';
import mailerConfig from './config/mailer.config';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig, redisConfig, mailerConfig],
      envFilePath: '.env',
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('redis.host'),
        port: configService.get('redis.port'),
        password: configService.get('redis.password'),
        db: configService.get('redis.db'),
      }),
      inject: [ConfigService],
    }),
    RedisModule,
    TypeOrmConfigModule,
    ThrottlerConfigModule,
    UserModule,
    AuthModule,
    FlashcardModule,
    FlashcardSetModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
