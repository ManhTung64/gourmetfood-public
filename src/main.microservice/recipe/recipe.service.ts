import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RecipeRepository } from './recipe.repository';
import { IRecipe } from './recipe.model';
import { Ingredients, Nutrion, NutrionCalculate, Recipe, StepBeforeUpload } from './dto/recipe.dto';
import { UploadFile } from '../file/dto/file.dto';
import { CategoryService } from '../category/category.service';
import { UserRepository } from '../user/user.repository';
import S3 from '../../otherModule/shared/s3.service';
import { FileService } from '../file/file.service';
import { ConstValue } from '../../otherModule/shared/defaultValues';
import { DataRatingForDashboard, RatingRecipe } from './dto/rating.dto';
import { CommentService } from '../comment/comment.service';
import { IRecipeComment } from '../comment/recipeComment/recipeComment.model';
import { RatingRepository } from './rating_recipe/rating.repository';
import { IRatingRecipe } from './rating_recipe/rating.model';
import { CreateSaveRecipe } from './dto/saveRecipe.dto';
import { FoodService } from '../algorithm/food.service';
import { Food } from '../algorithm/dto/food.dto';
import { CategoryRepository } from '../category/category.repository';
import { Category } from '../category/category.model';
import { NotificationService } from '../user/notification/notification.service';
import { BadWordService } from '../algorithm/badword.service';

@Injectable()
export class RecipeService {
    constructor(private readonly repository: RecipeRepository, private readonly categoryService: CategoryService,
        private readonly categoryRepository: CategoryRepository,
        private readonly userRepository: UserRepository,
        private readonly s3: S3,
        private readonly fileService: FileService,
        private readonly value: ConstValue,
        private readonly commentService: CommentService,
        private readonly ratingRepository: RatingRepository,
        private readonly foodService: FoodService,
        private readonly badwordService:BadWordService,
        private readonly notificationService:NotificationService
    ) {

    }
    public getOneRecipe = async (_id: string): Promise<unknown> => {
        try {
            return await this.repository.findRecipe(_id)
        } catch (error) {
            console.log(error)
            return null
        }
    }
    public getRecipesByUser = async (_id: string): Promise<IRecipe[]> => {
        try {
            return await this.repository.findRecipeByUser(_id)
        } catch (error) {
            console.log(error)
            return null
        }
    }
    public getAllRecipe = async(categoryName?:string):Promise<IRecipe[]>=>{
        try{
            if (!categoryName) return await this.repository.findAll()
            else return await this.repository.findByCategory(categoryName)
        }catch (error) {
            console.log(error)
            return null
        }
    }
    public findTopCollectionRecipe = async():Promise<IRecipe[]>=>{
        try{
            return (await this.repository.findTopCollectionRecipe()).slice(0,3)
        }catch (error) {
            console.log(error)
            return null
        }
    }
    public createNewRecipe = async (recipe: Recipe, steps: Array<StepBeforeUpload>, files: Array<UploadFile>): Promise<IRecipe | string[]> => {
        try {
            if (!await this.categoryService.checkExisted(recipe.Category, false)
                || !this.userRepository.findById(recipe.User_id)) return null
            if (recipe.type && recipe.type != 'Main') return null
            else if (recipe.type && recipe.type != 'Side') return null
            //check badword
            let listBadword:string[] = this.checkBadword(recipe.name + ' ' + recipe.description)
            if (listBadword.length > 0) return listBadword
            if (recipe.steps.length > 0)recipe.steps.map((step)=>{
                listBadword = this.checkBadword(step.detail)
                if (listBadword.length > 0) return listBadword
            })
            const uploadedFiles: Array<string> = await this.s3.UploadManyFiles(files)
            if (uploadedFiles) {
                recipe.image = uploadedFiles[0]
                // get ingredient and nutrion
                const nutrion:NutrionCalculate = this.getIngredients(recipe.ingredients)
                recipe.ingredients = nutrion.ingredients
                recipe.nutrion = nutrion.nutrion
                recipe.timeUpload = new Date()
                const newRecipe: IRecipe | null = await this.repository.addNew(recipe)
                if (newRecipe && newRecipe?._id) {
                    var id: string = newRecipe?._id?.toString()
                    //add file to file collection: lay ra recipeId, add recipeId and step no vao stepafterupload
                    await this.fileService.createFileStoreForRecipe(id, files, uploadedFiles, steps)
                    return newRecipe
                } else return newRecipe
            }
            else
             return null
        } catch (error) {
            console.log(error)
            return null
        }
    }
    private checkBadword = (content:string):string[]=>{
        try{
            const badwords:Array<string> | null = this.badwordService.badword.search(content.toLowerCase())
            if (badwords.length > 0) return badwords
            else return []
        }catch(error){
            console.log(error)
            return []
        }
    }
    public getIngredients = (inputIngredients: Ingredients[]):NutrionCalculate => {
        try {
            let nutrion:Nutrion = {calo:0, protein: 0, fat:0, fiber:0, carbs:0, sodium:0, sugar:0}
            if (inputIngredients.length < 1) throw new Error("Missing information")
            for (let i = 0; i < inputIngredients.length; i++) {
                const ingre: Food[] = this.foodService.getSearchFood(inputIngredients[i].name)
                if (ingre.length == 1){
                   ingre[0].units.map((unit)=>{
                     if (unit.unit == inputIngredients[i].quantitativeUnit) {
                        // nutrion each ingredient
                        inputIngredients[i].calo = unit.calo * inputIngredients[i].quantitative
                        inputIngredients[i].protein = unit.protein * inputIngredients[i].quantitative
                        inputIngredients[i].fat = unit.fat * inputIngredients[i].quantitative
                        inputIngredients[i].fiber = unit.fiber * inputIngredients[i].quantitative
                        inputIngredients[i].carbs = unit.carbs * inputIngredients[i].quantitative
                        inputIngredients[i].sodium = unit.sodium * inputIngredients[i].quantitative
                        inputIngredients[i].sugar = unit.sugar * inputIngredients[i].quantitative
                        // // // sum nutrion of all ingredients
                        nutrion.calo += inputIngredients[i].calo
                        nutrion.protein += inputIngredients[i].protein
                        nutrion.fat += inputIngredients[i].fat
                        nutrion.fiber += inputIngredients[i].fiber
                        nutrion.carbs += inputIngredients[i].carbs
                        nutrion.sodium += inputIngredients[i].sodium
                        nutrion.sugar += inputIngredients[i].sugar
                     }
                   })
                } 
            }
            return {ingredients:inputIngredients,nutrion:nutrion}
        } catch (error) {
            console.log(error)
            return null
        }
    }
    public deleteRecipeWithId = async (_id: string,isAdmin?:boolean): Promise<boolean> => {
        try {
            if (!_id) throw new Error("Missing information")
            const recipe:IRecipe = this.repository.findById(_id)
            if (!recipe) throw new Error("Recipe is not exitsted")
            // delete with admin role
            if (isAdmin) new Promise(()=>{this.notificationService.createReportNotification(recipe.title,recipe.User_id.toString())})
            const recipeComments: boolean = await this.commentService.deleteAllCommentOfRecipe(_id)
            if (!recipeComments) return this.value.Fail()
            if (await this.fileService.deleteFileOfRecipe(_id)){
                if (await this.repository.delete(_id)) return this.value.Success()
            } 
            else return this.value.Fail()
        } catch (error) {
            console.log(error)
            return this.value.Fail()
        }
    }
    public addNewOrUnsetRating = async (rating: RatingRecipe, Account_id: string): Promise<IRatingRecipe> | null => {
        try {
            const recipe:IRecipe = this.repository.findById(rating.Recipe_id)
            if (!recipe) return null
            else if (recipe.User_id.toString() == Account_id) return null
            rating.Account_id = Account_id
            rating.Category = recipe.Category.toString()
            if (!rating._id) return await this.ratingRepository.addNew(rating)
            else return await this.ratingRepository.update(rating,recipe.Category.toString())
        } catch (error) {
            console.log(error)
            return null
        }
    }
    public findUserWithRatingAvg = async()=>{
        try{
            const listUserWithRecipeAccount:IRecipe[] =  (await this.repository.findRecipesEachUser()).slice(0,10)
            if (!listUserWithRecipeAccount || listUserWithRecipeAccount.length == 0) return null

            const userRatingAvg:IRatingRecipe[] = await this.ratingRepository.findRatingAvg()
            if (!userRatingAvg || userRatingAvg.length == 0) return null

            let listUserWithRating:any = [...listUserWithRecipeAccount]
            listUserWithRecipeAccount.map((user, index)=>{
                userRatingAvg.find((rating:any)=>{
                    if (rating._id.toString() == user._id.toString()){
                        listUserWithRating[index].rating = parseFloat(rating.averageRating.toFixed(2))
                        return rating
                    } 
                })
            })
            return listUserWithRating.sort((a,b)=>b.rating-a.rating).slice(0,4)

        }catch (error) {
            console.log(error)
            return null
        }
        
    }
    public findRatingOfAllCategory = ()=>{
        try{    
            const listCategory:Category[] = this.categoryRepository.getAll()
            if (listCategory.length == 0) return null
            let avgRatingCategorys:DataRatingForDashboard = {rating:[],category:[],count:[],avgRating:[]}
            listCategory.map((category)=>{
                const listRatings:IRatingRecipe[] = this.ratingRepository.findByCategoryName(category.name)
                avgRatingCategorys.rating.push(listRatings.length)
                avgRatingCategorys.count.push(this.repository.findSimpleDataByCategory(category.name).length)
                avgRatingCategorys.avgRating.push(parseFloat(this.findAvgByCategoryName(listRatings).toFixed(1)))
            })
            const categoryName:string[] = listCategory.map(category=>category.name)
            avgRatingCategorys.category = categoryName
            return avgRatingCategorys
        }catch(error){
            console.log(error)
            return null
        }
    }
    public findRatingOfAllCategoryRaw = ()=>{
        try{    
            const result = this.findRatingOfAllCategory()
            let data = []
            if (result.category.length > 0) result.category.map((cate,index)=>{
                data.push({category:cate,ratingCount:result.rating[index],avg:result.avgRating[index]})
            })
            return data
        }catch(error){
            console.log(error)
            return null
        }
    }
    public getRecipesWithAvgRating = async ():Promise<IRecipe[]>=>{
        try{
            const recipes:any = await this.repository.findAllRecipeWithRating()
            recipes.sort((a,b)=>b.ratings.length - a.ratings.length)
            let topRecipes:any = recipes.slice(0,10)

            topRecipes = topRecipes.filter((recipe)=>{
                const checkDate = new Date()
                checkDate.setDate(checkDate.getDate() - 30)

                if(checkDate <= new Date(recipe.timeUpload)){
                    const sum:number = recipe.ratings.reduce((sum,rating)=>sum+rating.rating,0)
                return {...recipe,ratings:sum/recipe.ratings.length}
                }
            })
            return topRecipes.sort((a,b)=>b.ratings - a.ratings)
        }catch(error){
            console.log(error)
            return null
        }
    }
    private findAvgByCategoryName = (ratings:IRatingRecipe[]):number=>{
        try{
            if (ratings.length == 0) return 0
            const sum:number = ratings.reduce((sum,rating)=> sum + rating.rating,0)

            return sum / ratings.length
        }catch(error){
            return 0
        }
    }
    public getListCategory = ():Category[]=>{
        try{
            return this.categoryRepository.getAll()
        }catch(error){
            return null
        }
    }
}
