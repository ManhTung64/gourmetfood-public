import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { MealplanController } from './mealplan.controller';
import { ActivitymodeController } from './activitymode/activitymode.controller';

@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: 'MEALPLAN_SERVICE',
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
        },
        {
            provide: 'ACTIVITYMODE_SERVICE',
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
        },
    ],
    controllers: [MealplanController, ActivitymodeController],
})

export class MealplanModule {}
