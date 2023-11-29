import { Module, forwardRef } from '@nestjs/common';
import { FileService } from './file.service';
import { SharedModule } from '../../otherModule/shared/shared.module';
import { MongooseModule } from '@nestjs/mongoose';
import { fileSchema } from './file.model';
import { ArticleModule } from '../article/article.module';
import { FileRepository } from './file.repository';
import { CommentModule } from '../comment/comment.module';
import { RecipeModule } from '../recipe/recipe.module';

@Module({
  imports:[
    MongooseModule.forFeature([
      {
        name:'File',
        schema:fileSchema
      }
    ]),
    SharedModule,
    forwardRef(() => ArticleModule),
    CommentModule,
    forwardRef(() => RecipeModule),
  ],
  providers: [FileService, FileRepository],
  exports:[FileService, FileRepository]
})
export class FileModule {}
