import { Module} from '@nestjs/common';
import { RedisService } from './redis.service';
import { Redis } from 'ioredis';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [
    ConfigModule,
    {
      provide: 'SUBSCRIBER_REDIS_CLIENT',
      useFactory: (): Redis => {
        return new Redis({
          host: process.env.REDIS_HOST,
          port: 12614, 
          password: process.env.REDIS_PASSWORD,
          enableReadyCheck: true, 
        });
      },
    },
    {
      provide: 'WRITER_REDIS_CLIENT',
      useFactory: (): Redis => {
        return new Redis({
          host: process.env.REDIS_HOST,
          port: 12614, 
          password: process.env.REDIS_PASSWORD,
          enableReadyCheck: true,
        });
      },
    },
    RedisService,
  ],
  exports: [RedisService, 'SUBSCRIBER_REDIS_CLIENT']
})
export class RedisModule {}
