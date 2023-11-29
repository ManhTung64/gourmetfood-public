import { Module } from '@nestjs/common';
import { AdspackageController } from './adspackage.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  imports: [ConfigModule],
  providers:[
    {
      provide: 'ADSPACKAGE_SERVICE',
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
  controllers: [AdspackageController]
})
export class AdspackageModule {}
