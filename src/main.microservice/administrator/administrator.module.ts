import { Module, forwardRef } from '@nestjs/common';
import { AdministratorController } from './administrator.controller';
import { AdministratorService } from './administrator.service';
import { UserModule } from '../user/user.module';
import { SharedModule } from '../../otherModule/shared/shared.module';
import { ArticleModule } from '../article/article.module';
import { RecipeModule } from '../recipe/recipe.module';
import { CategoryModule } from '../category/category.module';
import { ReportModule } from '../report/report.module';


@Module({
  imports:[
    forwardRef(() => UserModule),
    SharedModule,
    ArticleModule,
    RecipeModule,
    CategoryModule,
    ReportModule
  ],
  controllers: [AdministratorController],
  providers: [AdministratorService],
  exports:[AdministratorService]
})
export class AdministratorModule {}
