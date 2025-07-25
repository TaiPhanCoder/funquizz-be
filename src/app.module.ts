import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { UserModule } from './modules/user/user.module';
import databaseConfig from './config/database.config';
import appConfig from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig],
      envFilePath: '.env',
    }),
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: (configService: ConfigService) => {
    //     const dbConfig = configService.get('database');
    //     return dbConfig || {};
    //   },
    //   inject: [ConfigService],
    // }),
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
    // UserModule, // Temporarily disabled until database is connected
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
