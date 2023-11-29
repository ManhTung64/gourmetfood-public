import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CollectionRepository } from './collection.repository';
import { ConstValue } from '../../../otherModule/shared/defaultValues';
import { UserRepository } from '../../user/user.repository';
import { CreateCollection, CreateDefaultCollection, RemoveCollection, UpdateCollection } from '../dto/collection.dto';
import { ICollection } from './collection.model';
import { CreateSaveRecipe, RemoveSaveRecipe } from '../dto/saveRecipe.dto';
import { RecipeRepository } from '../recipe.repository';
import { SaveRecipeRepository } from '../saveRecipe/saveRecipe.repository';
import { ISaveRecipe } from '../saveRecipe/saveRecipe.model';
import { RedisService } from '../../../otherModule/redis/redis.service';

@Injectable()
export class CollectionService {
    constructor(private readonly repository:CollectionRepository, private readonly value:ConstValue,
        private readonly userRepository:UserRepository,
        private readonly recipeRepository:RecipeRepository,
        private readonly saveRecipeRepository:SaveRecipeRepository,
        private readonly redisService:RedisService
        ){

    }
    public getAllCollection = (_id:string):ICollection[]=>{
        try{
            return this.repository.getAll()
        }catch(error){
            console.log(error)
            return null
        }
    }
    public getAllRecipeByCollection = async(_id:string,user_id:string):Promise<ICollection[]>=>{
        try{
           const collection:ICollection = this.repository.findById(_id)
           if (!collection || collection.Account_id.toString() != user_id) return null
           return await this.repository.getRecipesOfCollection(_id)
           return
        }catch(error){
            console.log(error)
            return null
        }
    }
    public getRecipe = async(_id:string):Promise<ISaveRecipe>=>{
        try{
           const item:ISaveRecipe = this.saveRecipeRepository.findById(_id)
           if (!item) return null
           return await this.saveRecipeRepository.getRecipe(_id)
        }catch(error){
            console.log(error)
            return null
        }
    }
    public addDefaultCollection = async (Account_id:string):Promise<boolean>=>{
        try{
            if (!Account_id) throw new Error("Missing information")
            else if (!await this.userRepository.findById(Account_id)) throw new Error("Account is not existed")
            const defaultCollection:CreateDefaultCollection = {name:"My favourite recipes",Account_id:Account_id}
            if (await this.repository.addNew(defaultCollection)) return this.value.Success()
            else throw new Error("Add collection failed")
        }catch(error){
            console.log(error)
            return this.value.Fail()
        }
    }
    public addCollection = async (newCollection:CreateCollection):Promise<ICollection | null>=>{
        try{
            if (!newCollection.Account_id || !newCollection.name) throw new Error("Missing information")
            else if (!await this.userRepository.findById(newCollection.Account_id)) throw new Error("Account is not existed")
            return await this.repository.addNew(newCollection)
        }catch(error){
            console.log(error)
            return null
        }
    }
    public updateCollectionName = async (updateCollection:UpdateCollection):Promise<ICollection | null>=>{
        try{
            if (!await this.repository.findById(updateCollection._id)) throw new Error("Not existed")
            const collection:ICollection | null = await this.repository.update(updateCollection)
            if (!collection) throw new Error("Updated fail")
            else return collection
        }catch(error){
            console.log(error)
            return null
        }
    }
    public deleteCollection = async (deleteCollection:RemoveCollection):Promise<boolean>=>{
        try{
            const collection: ICollection | null = await this.repository.findById(deleteCollection._id)
            if (!collection) throw new Error("Collection is not existed")
            if (await this.saveRecipeRepository.deleteSaveRecipeByCollection_id(deleteCollection._id) && await this.recipeRepository.delete(deleteCollection._id))return this.value.Success()
            else throw new Error("Delete failed")
        }catch(error){
            console.log(error)
            return this.value.Fail()
        }
    }
    public addToCollection = async (saveRecipe:CreateSaveRecipe):Promise<ISaveRecipe | null>=>{
        try{
            if (!this.repository.findById(saveRecipe.Collection_id)) return null
            else if (saveRecipe.isRecipe){ // save recipe
                if (!this.recipeRepository.findById(saveRecipe._id)) return null
                else if (await this.saveRecipeRepository.findByCollection_idAndRecipe_idOrMealplan_id(saveRecipe.Collection_id, saveRecipe._id,saveRecipe.isRecipe)) return null
                saveRecipe.Recipe_id = saveRecipe._id
            } else{                        //save mealplan
                const listMealplan:any = this.redisService.getValue("mealplan")
                if (!listMealplan) return null
                else if (!listMealplan.find((mealplan)=>mealplan._id == saveRecipe._id)) return null
                else if (await this.saveRecipeRepository.findByCollection_idAndRecipe_idOrMealplan_id(saveRecipe.Collection_id, saveRecipe._id,saveRecipe.isRecipe)) return null
                saveRecipe.MealPlan_id = saveRecipe._id
            }
            saveRecipe.saveDate = new Date()
            const succes:ISaveRecipe | null = await this.saveRecipeRepository.addNew(saveRecipe)
            return succes
        }catch(error){
            console.log(error)
            return null
        }
    }
    public RemoveToCollection = async (saveRecipe:RemoveSaveRecipe, Account_id:string):Promise<boolean>=>{
        try{
            const collection: ICollection | null = await this.repository.findById(saveRecipe._id)
            if (!collection) throw new Error("Collection is not existed")
            else if (Account_id != collection.Account_id.toString()) throw new HttpException("Unauthorized",HttpStatus.UNAUTHORIZED)
            if (await this.saveRecipeRepository.delete(saveRecipe._id)) return this.value.Success()
            else throw new Error("Remove failed")
        }catch(error){
            console.log(error)
            return this.value.Fail()
        }
    }
}
