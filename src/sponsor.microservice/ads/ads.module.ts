import { Module } from '@nestjs/common';
import { AdsController } from './ads.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { SharedModule } from '../../otherModule/shared/shared.module';

@Module({
  imports: [ConfigModule, SharedModule],
  providers:[
    {
      provide: 'ADS_SERVICE',
      useFactory: (configService: ConfigService) => {
          return ClientProxyFactory.create({
              transport: Transport.TCP,
              options: {
                  host: configService.get('SPONSOR_SERVICE_HORT'),
                  port: configService.get('SPONSOR_SERVICE_PORT'),
              },
          });
      },
      inject: [ConfigService], 
  },
  ],
  controllers: [AdsController],
})
export class AdsModule {}
