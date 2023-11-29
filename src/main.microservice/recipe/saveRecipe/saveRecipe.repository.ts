import { Repository } from "../../../../base/base.repository";
import { ISaveRecipe } from "./saveRecipe.model";
import { Model, Types } from "mongoose";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class SaveRecipeRepository extends Repository<ISaveRecipe>{
    constructor(@InjectModel('SaveRecipe') private readonly saveRecipeModel: Model<ISaveRecipe>
    ) {
        super(saveRecipeModel)
    }
    public findByCollection_idAndRecipe_idOrMealplan_id = async (Collection_id: string, _id: string, isMealPlan:boolean): Promise<boolean> => {
        try {
            const find: ISaveRecipe = (!isMealPlan)? this.data.find(data => 
                { return data.Collection_id.toString() == Collection_id && data.Recipe_id.toString() == _id }):
                this.data.find(data => 
                    { return data.Collection_id.toString() == Collection_id && data.MealPlan_id.toString() == _id })
            if (!find) return null
            else return this.value.Existed()
        } catch (error) {
            console.log(error)
            return this.value.Fail()
        }
    }
    public deleteSaveRecipeByCollection_id = async (collection_id: string): Promise<boolean> => {
        try {
            if (await this.saveRecipeModel.deleteMany({ Collection_id: collection_id })) {
                await this.updateData()
                return this.value.Success()
            }
            else throw new Error("Delete failed")
        } catch (error) {
            console.log(error)
            return this.value.Fail()
        }
    }
    public getRecipe = async (_id:string):Promise<ISaveRecipe>=>{
        try{
            return await this.saveRecipeModel.aggregate([
                {
                    $match:{
                        $or:[
                            {Recipe_id:new Types.ObjectId(_id)},
                            {MealPlan_id:new Types.ObjectId(_id)}
                        ]
                    }
                },{
                    $lookup:{
                        from:'recipes',
                        localField:'Recipe_id',
                        foreignField:'_id',
                        as:'recipe'
                    }
                },{
                    $lookup:{
                        from:'meaplans',
                        localField:'list_reipes.MealPlan_id',
                        foreignField:'_id',
                        as:'mealplan'
                    }
                },{
                    $project:{
                        _id:1,
                        saveDate:1,
                        name:1,
                        recipe:'$recipe',
                        mealplan:'$mealplan'
                        
                    }
                }
            ])[0]
        }catch(error){
            console.log(error)
            return null
        }
    }
    public getTopRecipesWithInfo = async (): Promise<unknown> =>{
        try {
          const topRecipesWithInfo = await this.saveRecipeModel.aggregate([
            {
              $group: {
                _id: '$Recipe_id', // Nhóm theo trường recipe_id
                count: { $sum: 1 }, // Đếm số lượng xuất hiện
              },
            },
            {
              $sort: { count: -1 }, // Sắp xếp theo số lượng giảm dần (top xuất hiện nhiều nhất đến ít nhất)
            },
            {
              $limit: 10, // Chỉ lấy top 10
            },
            {
              $lookup: {
                from: 'recipeinfos', // Tên của collection để lookup
                localField: '_id',
                foreignField: 'recipe_id',
                as: 'recipeInfo', // Tên của trường chứa thông tin recipe trong kết quả
              },
            },
            {
              $unwind: '$recipeInfo', // Đảm bảo mỗi document chỉ chứa một bản ghi của recipeInfo
            },
          ]);
      
          console.log(topRecipesWithInfo);
          return topRecipesWithInfo;
        } catch (error) {
          console.error('Error:', error);
          throw error;
        }
      }
}