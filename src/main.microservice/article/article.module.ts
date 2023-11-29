import { Module, forwardRef } from '@nestjs/common';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { SharedModule } from '../../otherModule/shared/shared.module';
import { articleSchema } from './article.model';
import { MongooseModule } from '@nestjs/mongoose';
import { ArticleRepository } from './article.repository';
import { UserModule } from '../user/user.module';
import { FileModule } from '../file/file.module';
import { ArticleStateRepository } from './state/articleState.repository';
import { articleStateSchema } from './state/state.model';
import { ArticleStateService } from './state/articleState.service';
import { AlgorithmModule } from '../algorithm/algorithm.module';
import { RedisModule } from '../../otherModule/redis/redis.module';

@Module({
  imports:[
    MongooseModule.forFeature([
      {name:'Article',schema: articleSchema},
      {name:'ArticleState',schema:articleStateSchema}
    ]),
    SharedModule,
    forwardRef(() =>UserModule),
    forwardRef(() =>FileModule),
    AlgorithmModule,
    RedisModule
  ],
  controllers: [ArticleController],
  providers: [ArticleService, ArticleRepository, ArticleStateRepository, ArticleStateService],
  exports:[ArticleService, ArticleRepository, ArticleStateService]
})
export class ArticleModule {}
