import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { TypeOrmConfigModule } from './config/typeorm.config';
import { ThrottlerConfigModule } from './config/throttler.config';
import { RedisModule } from './config/redis.module';
import databaseConfig from './config/database.config';
import appConfig from './config/app.config';
import redisConfig from './config/redis.config';
import mailerConfig from './config/mailer.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig, redisConfig, mailerConfig],
      envFilePath: '.env',
    }),
    RedisModule,
    TypeOrmConfigModule,
    ThrottlerConfigModule,
    UserModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
