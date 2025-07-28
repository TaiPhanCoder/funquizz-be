import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { TypeOrmConfigModule } from './config/typeorm.config';
import { ThrottlerConfigModule } from './config/throttler.config';
import { RedisModule } from './config/redis.module';
import databaseConfig from './config/database.config';
import appConfig from './config/app.config';
import redisConfig from './config/redis.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig, redisConfig],
      envFilePath: '.env',
    }),
    RedisModule,
    TypeOrmConfigModule,
    ThrottlerConfigModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
