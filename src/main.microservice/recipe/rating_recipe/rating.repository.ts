import { Repository } from "../../../../base/base.repository";
import { IRatingRecipe } from "./rating.model";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { RatingRecipe } from "../dto/rating.dto";
import { RedisService } from "../../../otherModule/redis/redis.service";

@Injectable()
export class RatingRepository extends Repository<IRatingRecipe>{
    constructor(@InjectModel('RatingRecipe') private readonly ratingModel:Model<IRatingRecipe>, private readonly rService:RedisService){
        super(ratingModel,rService,'rating')
    }
    public update = async (update:RatingRecipe,category:string):Promise<IRatingRecipe | null>=>{
        try{
            const rating:IRatingRecipe =  await this.ratingModel.findByIdAndUpdate(update._id,{Category:category,rating:update.rating},{returnDocument:'after'})
            if (rating) this.updateAtId(rating)
            return rating
        }catch(error){
            console.log(error)
            return null
        }
    }
    public findByCategoryName = (category:string):IRatingRecipe[]=>{
        try{
            return this.data.filter((data)=>{return data.Category == category})
        }catch(error){
            return null
        }
    }
    public findRatingAvg = async ()=>{
        try{
            return await this.ratingModel.aggregate([
                {
                    $lookup: {
                      from: 'recipes', 
                      localField: 'Recipe_id',
                      foreignField: '_id',
                      as: 'recipeInfo', 
                    },
                  },
                  {
                    $group: {
                      _id: '$recipeInfo.User_id', 
                      averageRating: { $avg: '$rating' }
                    },
                  },
                  {
                    $sort: { averageRating: -1 }, 
                  }
            ])
        }catch(error){
            return null
        }
    }
}