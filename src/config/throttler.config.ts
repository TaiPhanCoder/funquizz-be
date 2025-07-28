import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get('app.throttle.ttl') || 60,
            limit: configService.get('app.throttle.limit') || 10,
          },
        ],
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [ThrottlerModule],
})
export class ThrottlerConfigModule {}