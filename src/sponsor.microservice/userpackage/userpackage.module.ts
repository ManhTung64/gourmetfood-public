import { Module } from '@nestjs/common';
import { UserpackageController } from './userpackage.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  imports: [ConfigModule],
  controllers: [UserpackageController],
  providers:[
    {
      provide: 'USERPACKAGE_SERVICE',
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
  ]
})
export class UserpackageModule {}
