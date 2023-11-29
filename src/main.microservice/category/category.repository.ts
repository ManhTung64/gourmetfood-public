import { Repository } from "../../../base/base.repository";
import { Category} from "./category.model";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Injectable } from "@nestjs/common";
import { CategoryWithId } from "./dto/category.dto";
import { RedisService } from "../../otherModule/redis/redis.service";

@Injectable()
export class CategoryRepository extends Repository<Category>{
    constructor(@InjectModel('Category') private readonly categoryModel: Model<Category>, private readonly redis:RedisService){
        super(categoryModel,redis,'categories')
    }
    public findCategoryByName = async(name:string):Promise<Category | null>=>{
        try{
          const category:Category = this.data.find(data =>{return data.name == name})
          if (!category) return null
          else return category
        }catch(error){
          console.log(error)
          return null
        }
      }
      public updateCategoryById = async(update:CategoryWithId):Promise<Category | null>=>{
        try{
          const updateCategory:Category = await this.categoryModel.findByIdAndUpdate(update._id,
            {
              name:update.name,
              image:update.image,
              description:update.description
            },{returnDocument:'after'})
          if (updateCategory) this.updateAtId(updateCategory)
          return updateCategory
        }catch(error){
          console.log(error)
          return null
        }
      }
      public findQuantityRecipeEachCategory = async()=>{
        try{
          const data:any = await this.categoryModel.aggregate([
            {
              $lookup:{
                from:'recipes',
                localField:'name',
                foreignField:'Category',
                as:'recipes'
              }
            },{
              $lookup:{
                from:'users',
                localField:'recipes.User_id',
                foreignField:'_id',
                as:'user'
              }
            },{
              $project:{
                _id:1,
                name:1,
                image:1,
                description:1,
                recipes:'$recipes',
                users:'$user'
              }
            }
          ])
          for (let category = 0; category < data.length;category++){

            const count = {} // create count
            for (let user = 0; user < data[category].users.length; user++){ //loop
              // if ex, count + 1 else 0 + 1
              count[data[category].users[user]._id] = (count[data[category].users[user]._id] || 0) + 1
            }
            const sortedCount = Object.keys(count).sort((a, b) => count[b] - count[a]); // sort 
            data[category].top = sortedCount.slice(0, 5)//get top 5

            for (let i = 0; i < data[category].top.length; i++){
              //get id and count
              data[category].top[i] = {_id:data[category].top[i],count:count[data[category].top[i]]}
            }

            //compare id to get object (information)
            for (let i = 0; i < data[category].top.length;i++){
              data[category].users.map((user)=>{
                if (user._id == data[category].top[i]._id){
                  user.count = data[category].top[i].count
                  data[category].top[i] = user
                }
              })
            }
            data[category].users = null
          }
          return data
        }catch(error){
          console.log(error)
          return null
        }
      }
}