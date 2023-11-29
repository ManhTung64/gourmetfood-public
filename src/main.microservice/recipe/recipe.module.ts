import { Module, forwardRef } from '@nestjs/common';
import { RecipeController } from './recipe.controller';
import { RecipeService } from './recipe.service';
import { MongooseModule } from '@nestjs/mongoose';
import { recipeSchema } from './recipe.model';
import { CategoryModule } from '../category/category.module';
import { SharedModule } from '../../otherModule/shared/shared.module';
import { FileModule } from '../file/file.module';
import { UserModule } from '../user/user.module';
import { RecipeRepository } from './recipe.repository';
import { RatingRepository } from './rating_recipe/rating.repository';
import { ratingSchema } from './rating_recipe/rating.model';
import { CommentModule } from '../comment/comment.module';
import { collectionSchema } from './collection/collection.model';
import { saveRecipeSchema } from './saveRecipe/saveRecipe.model';
import { SaveRecipeRepository } from './saveRecipe/saveRecipe.repository';
import { CollectionRepository } from './collection/collection.repository';
import { CollectionService } from './collection/collection.service';
import { CollectionController } from './collection/collection.controller';
import { AlgorithmModule } from '../algorithm/algorithm.module';
import { RedisModule } from '../../otherModule/redis/redis.module';


@Module({
  imports:[
    MongooseModule.forFeature([
        {name:'Recipe', schema:recipeSchema},
        {name:'RatingRecipe',schema:ratingSchema},
        {name:'SaveRecipe',schema:saveRecipeSchema},
        {name:'Collection',schema:collectionSchema}
    ]),
    CategoryModule,
    SharedModule,
    forwardRef(() =>UserModule),
    forwardRef(() =>FileModule),
    forwardRef(() =>CommentModule),
    AlgorithmModule,
    RedisModule
  ],
  controllers: [RecipeController, CollectionController],
  providers: [RecipeService, RecipeRepository, RatingRepository, SaveRecipeRepository, CollectionRepository, CollectionService],
  exports:[RecipeRepository, RatingRepository, RecipeService, CollectionService]
})
export class RecipeModule {}
