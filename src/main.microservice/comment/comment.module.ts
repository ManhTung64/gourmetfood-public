import { Module, forwardRef } from '@nestjs/common';
import { CommentService } from './comment.service';
import { MongooseModule } from '@nestjs/mongoose';
import { articleCommentSchema } from './articleComment/articleComment.model';
import { ArticleCommentRepository } from './articleComment/articleComment.repository';
import { FileModule } from '../file/file.module';
import { ArticleModule } from '../article/article.module';
import { UserModule } from '../user/user.module';
import { SharedModule } from '../../otherModule/shared/shared.module';
import { CommentController } from './comment.controller';
import { recipeCommentSchema } from './recipeComment/recipeComment.model';
import { RecipeCommentRepository } from './recipeComment/recipeComment.repository';
import { RecipeModule } from '../recipe/recipe.module';
import { AlgorithmModule } from '../algorithm/algorithm.module';

@Module({
  imports:[
    MongooseModule.forFeature([
      {name:'ArticleComment',schema:articleCommentSchema},
      {name:'RecipeComment',schema:recipeCommentSchema}
    ]),
    forwardRef(() =>FileModule),
    forwardRef(() =>ArticleModule),
    forwardRef(() =>UserModule),
    SharedModule,
    AlgorithmModule,
    forwardRef(() =>RecipeModule)
  ],
  providers: [CommentService, ArticleCommentRepository, RecipeCommentRepository],
  exports:[ArticleCommentRepository, CommentService, RecipeCommentRepository],
  controllers: [CommentController]
})
export class CommentModule {}
