import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Service } from '../../../base/base.service';
import { ArticleRepository } from '../article/article.repository';
import { CategoryRepository } from '../category/category.repository';
import { RecipeRepository } from '../recipe/recipe.repository';
import { ConstValue } from '../../otherModule/shared/defaultValues';
import { BaseUser } from '../user/dto/user.dto';
import { UserRepository } from '../user/user.repository';
import { CountData } from './dto/admin.dto';
import { RecipeService } from '../recipe/recipe.service';
import { IRecipe } from '../recipe/recipe.model';
import { IArticle } from '../article/article.model';
import { ReportService } from '../report/report.service';
import { IReport } from '../report/report.model';
import { IUser } from '../user/user.model';

@Injectable()
export class AdministratorService extends Service {
  constructor(private readonly repository: UserRepository,
    private readonly value: ConstValue,
    private readonly userRepository: UserRepository,
    private readonly articleRepository: ArticleRepository,
    private readonly recipeRepository: RecipeRepository,
    private readonly recipeService: RecipeService,
    private readonly categoryRepository: CategoryRepository,
    private readonly reportService:ReportService
  ) {
    super()
  }
  public getUserList = async (): Promise<Array<BaseUser> | null> => {
    try {
      const listUsers: Array<BaseUser> | null = await this.repository.getAllUsers()
      return listUsers
    } catch (error) {
      console.log(error)
      return null
    }
  }
  public UpdateStateActiveForUser = async (active: boolean, _id?: string, email?: string): Promise<boolean> => {
    try {
      if ((!_id && !email) || active == null) throw new HttpException("Missing information", HttpStatus.BAD_REQUEST)
      if (email) {
        if (await this.repository.changeStateAccountByEmail(email, !active)) return this.value.Success()
        else return this.value.Fail()
      }
      else if (_id && await this.repository.changeStateAccountById(_id, !active)) return this.value.Success()
      else return this.value.Fail()
    } catch (error) {
      console.log(error)
      return this.value.Fail()
    }
  }
  public getCountData = (): CountData => {
    try {
      const curMonth:number = new Date().getMonth()
      const lastMonth:number = (curMonth == 1)? 12: curMonth - 1

      const totalUser: IUser[] = this.userRepository.getAll()
      const totalRecipe: IRecipe[] = this.recipeRepository.getAll()
      const totalArticle: IArticle[] = this.articleRepository.getAll()
      
      let curMonthCount:number = 0
      let lastMonthCount:number = 0
      let rate:number = 0
      //rate user
      curMonthCount = totalUser.filter((user)=>{return user.createAt.getMonth() == curMonth}).length
      lastMonthCount = totalUser.filter((user)=>{return user.createAt.getMonth() == lastMonth}).length
      rate = (curMonthCount - lastMonthCount)/lastMonthCount * 100 
      const ratingDevUser:object = {currentMonth:curMonthCount, rate:Math.floor(rate)}

      curMonthCount = totalRecipe.filter((recipe)=>{return recipe.timeUpload.getMonth() == curMonth}).length
      lastMonthCount = totalRecipe.filter((recipe)=>{return recipe.timeUpload.getMonth() == lastMonth}).length
      rate = (curMonthCount - lastMonthCount)/lastMonthCount * 100 
      const ratingDevRecipe:object = {currentMonth:curMonthCount, rate:Math.floor(rate)}

      curMonthCount = totalArticle.filter((article)=>{return article.timeUpload.getMonth() == curMonth}).length
      lastMonthCount = totalArticle.filter((article)=>{return article.timeUpload.getMonth() == lastMonth}).length
      rate = (curMonthCount - lastMonthCount)/lastMonthCount * 100 
      const ratingDevArticle:object = {currentMonth:curMonthCount, rate:Math.floor(rate)}

      const data: CountData = { ratingDevUser, ratingDevRecipe, ratingDevArticle }
      return data
    } catch (error) {
      console.log(error)
      return null
    }
  }
  public getRatingOfCategory = () => {
    try {
      return this.recipeService.findRatingOfAllCategory()
    } catch (error) {
      console.log(error)
      return null
    }
  }
  public getUserInformation = async (): Promise<unknown> => {
    try {
      return await this.userRepository.getUserWithArticleAndRecipeAndPlanMealQuantity()
    } catch (error) {
      console.log(error)
      return null
    }
  }
  public getRecipesEachCategory = async()=>{
    try {
      return await this.categoryRepository.findQuantityRecipeEachCategory()
    } catch (error) {
      console.log(error)
      return null
    }
  }
  public getTopTrendingRecipe = async ():Promise<IRecipe[]>=>{
    try{
      return await this.recipeService.getRecipesWithAvgRating()
    }catch (error) {
      console.log(error)
      return null
    }
  }
  public getArticlesInformation = async ()=>{
    try{
      const articles:IArticle[] = await this.articleRepository.findArticleWithAuthor()
      // const report:IReport[] = 
      return articles
    }catch (error) {
      console.log(error)
      return null
    }
  }
  public getRecipesInformation = async()=>{
    try{
      const recipes:IRecipe[] = await this.recipeRepository.findRecipeWithAuthor()
      // const report:IReport[] = 
      return recipes
    }catch (error) {
      console.log(error)
      return null
    }
  }
  public getUserByMonth = async():Promise<any>=>{
    try{
      const users:any = await this.userRepository.getUserByMonth()
      return this.sortByMonth(users)
    }catch (error) {
      console.log(error)
      return null
    }
  }
  public getSponsorByMonth = async():Promise<any>=>{
    try{
      const sponsors:any = await this.userRepository.getSponsorByMonth()
      return this.sortByMonth(sponsors)
    }catch (error) {
      console.log(error)
      return null
    }
  }
  private sortByMonth = (users:any)=>{
    try{
      // insert to null month
      for (let i = 1; i <= 12; i++) {
        if (!users.some(obj => obj.month === i)) {
          users.push({ "count": 0, "month": i })
        }
      }
      users.sort((a,b)=>a.month - b.month)
      return users
    }catch(error){
      return null
    }
  }
  public getListSponsor = async ():Promise<IUser[]>=>{
    try{
        return await this.userRepository.getSponsorWithPackage()
    }catch(error){
        console.log(error)
        return null
    }
}
}
