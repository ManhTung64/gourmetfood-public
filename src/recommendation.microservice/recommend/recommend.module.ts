import { Module } from '@nestjs/common';
import { RecommendController } from './recommend.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { RecipeModule } from '../../main.microservice/recipe/recipe.module'; 

@Module({
  imports: [ConfigModule, RecipeModule],
  controllers: [RecommendController],
  providers:[
    {
      provide: 'RECOMMEND_SERVICE',
      useFactory: (configService: ConfigService) => {
          return ClientProxyFactory.create({
              transport: Transport.TCP,
              options: {
                  host: configService.get('RECOMMENDATION_SERVICE_HORT'),
                  port: configService.get('RECOMMENDATION_SERVICE_PORT'),
              },
          });
      },
      inject: [ConfigService], 
  },
  ]
})
export class RecommendModule {}
