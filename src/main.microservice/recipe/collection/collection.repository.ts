import { Repository } from "../../../../base/base.repository";
import { ICollection } from "./collection.model";
import { Injectable } from "@nestjs/common";
import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { UpdateCollection } from "../dto/collection.dto";

@Injectable()
export class CollectionRepository extends Repository<ICollection>{
    constructor(@InjectModel('Collection') private readonly collectionModel:Model<ICollection>){
        super(collectionModel)
    }
    public update = async (collection:UpdateCollection):Promise<ICollection | null>=>{
        try{
            const collectionUpdated:ICollection = await this.collectionModel.findByIdAndUpdate(collection._id,{name:collection.name},{returnDocument:'after'})
            if (collectionUpdated)this.updateAtId(collectionUpdated)
            return collectionUpdated
        }catch(error){
            console.log(error)
            return null
        }
    }
    public getRecipesOfCollection = async (collection_id:string):Promise<ICollection[]>=>{
        try{
            return await this.collectionModel.aggregate([
                {
                    $match:{_id:new Types.ObjectId(collection_id)}
                },
                {
                    $lookup:{
                        from:'saverecipes',
                        localField:'Collection_id',
                        foreignField:'_id',
                        as:'list_recipes'
                    }
                },{
                    $lookup:{
                        from:'recipes',
                        localField:'list_reipes.Recipe_id',
                        foreignField:'_id',
                        as:'recipes'
                    }
                },{
                    $lookup:{
                        from:'meaplans',
                        localField:'list_reipes.MealPlan_id',
                        foreignField:'_id',
                        as:'mealplans'
                    }
                },{
                    $project:{
                        _id:1,
                        name:1,
                        listRecipes:'$recipe',
                        listMealPlan:'$mealplans'
                    }
                }
            ])
        }catch(error){
            console.log(error)
            return null
        }
    }
}