import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { MongooseModule } from '@nestjs/mongoose';
import { categorySchema } from './category.model';
import { SharedModule } from '../../otherModule/shared/shared.module';
import { CategoryRepository } from './category.repository';
import { RedisModule } from '../../otherModule/redis/redis.module';

@Module({
  imports:[
    MongooseModule.forFeature([{name:'Category',schema: categorySchema}]),
    SharedModule,
    RedisModule
  ],
  controllers: [CategoryController],
  providers: [CategoryService, CategoryRepository],
  exports:[CategoryService, CategoryRepository]
})
export class CategoryModule {}
