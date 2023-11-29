import { Module, forwardRef } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { reportSchema } from './report.model';
import { ReportRepository } from './report.repository';
import { Article } from '../article/dto/article.dto';
import { ArticleModule } from '../article/article.module';
import { AlgorithmModule } from '../algorithm/algorithm.module';
import { SharedModule } from '../../otherModule/shared/shared.module';
import { AuthModule } from '../auth/auth.module';
import { CommentModule } from '../comment/comment.module';
import { RecipeModule } from '../recipe/recipe.module';
import { UserModule } from '../user/user.module';

@Module({
  imports:[
    MongooseModule.forFeature([
      {name:'Report',schema:reportSchema}
    ]),
    ArticleModule,
    AlgorithmModule,
    SharedModule,
    CommentModule,
    forwardRef(()=>UserModule),
    forwardRef(() =>RecipeModule)
  ],
  providers: [ReportService, ReportRepository],
  controllers: [ReportController],
  exports:[ReportService,ReportRepository]
})
export class ReportModule {}
