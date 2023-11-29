import { Module, forwardRef } from '@nestjs/common';
import { FoodService } from './food.service';
import { BadWordService } from './badword.service';
import { SearchService } from './search.service';
import { UserModule } from '../user/user.module';
import { RecipeModule } from '../recipe/recipe.module';
import { ArticleModule } from '../article/article.module';

@Module({
    imports:[
        forwardRef(()=>UserModule),
        forwardRef(()=>RecipeModule),
        forwardRef(()=>ArticleModule)
    ],
    providers:[FoodService, BadWordService,SearchService],
    exports:[FoodService, BadWordService,SearchService]
})
export class AlgorithmModule {}
