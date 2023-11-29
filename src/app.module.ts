import { Module } from '@nestjs/common';
import { UserModule } from './main.microservice/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { AdministratorModule } from './main.microservice/administrator/administrator.module';
import { facebookStrategy, googleStrategy } from './configurations/passport.config';
import { SharedModule } from './otherModule/shared/shared.module';
import { CategoryModule } from './main.microservice/category/category.module';
import { ArticleModule } from './main.microservice/article/article.module';
import { FileModule } from './main.microservice/file/file.module';
import { CommentModule } from './main.microservice/comment/comment.module';
import { RecipeModule } from './main.microservice/recipe/recipe.module';
import { AuthModule } from './main.microservice/auth/auth.module';
import { EventGateWay } from './event.gateway';
import { AlgorithmModule } from './main.microservice/algorithm/algorithm.module';
import { ReportModule } from './main.microservice/report/report.module';
import { MessageModule } from './main.microservice/message/message.module';
import { MealplanModule } from './mealplan.microservice/mealplan/mealplan.module';
import { RedisModule } from './otherModule/redis/redis.module';
import { UserhealthModule } from './mealplan.microservice/userhealth/userhealth.module';
import { UserpackageModule } from './sponsor.microservice/userpackage/userpackage.module';
import { AdspackageModule } from './sponsor.microservice/adspackage/adspackage.module';
import { AdsModule } from './sponsor.microservice/ads/ads.module';
import { DiseaseModule } from './mealplan.microservice/disease/disease.module';
import { RecommendModule } from './recommendation.microservice/recommend/recommend.module';

@Module({
  imports: [
    UserModule,
    AdministratorModule,
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB),
    PassportModule.register({}),
    AdministratorModule,
    SharedModule,
    CategoryModule,
    ArticleModule,
    FileModule,
    CommentModule,
    RecipeModule,
    AuthModule,
    EventGateWay,
    AlgorithmModule,
    ReportModule,
    MessageModule,
    MealplanModule,
    RedisModule,
    UserhealthModule,
    UserpackageModule,
    AdspackageModule,
    AdsModule,
    DiseaseModule,
    RecommendModule
  ],
  controllers: [],
  providers: [facebookStrategy,googleStrategy],
})
export class AppModule {
  constructor() {
    try {
      const mongooseConnection = MongooseModule.forRoot(process.env.MONGODB)
      if (mongooseConnection) console.log("Database connected")
    } catch (error) {
      console.log('Connecting to DB is failed')
      console.log(error)
      process.exit(1)
    }
  }
}






