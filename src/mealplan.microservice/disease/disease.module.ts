import { Module } from '@nestjs/common';
import { DiseaseController } from './disease.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  imports: [ConfigModule],
    providers: [
        {
            provide: 'DISEASE_SERVICE',
            useFactory: (configService: ConfigService) => {
                return ClientProxyFactory.create({
                    transport: Transport.TCP,
                    options: {
                        host: configService.get('MEALPLAN_SERVICE_HOST'),
                        port: configService.get('MEALPLAN_SERVICE_PORT'),
                    },
                });
            },
            inject: [ConfigService], 
        },],
  controllers: [DiseaseController]
})
export class DiseaseModule {}
