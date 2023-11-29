import { Repository } from "../../../../base/base.repository";
import { IRecipeComment } from "./recipeComment.model";
import { Model, Types } from "mongoose";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { RecipeComment } from "../dto/recipeComment.dto";

@Injectable()
export class RecipeCommentRepository extends Repository<IRecipeComment>{
    constructor(@InjectModel('RecipeComment') private readonly recipeCommentModel:Model<IRecipeComment>){
        super(recipeCommentModel)
    }
    public updateById = async (comment:RecipeComment):Promise<IRecipeComment | null>=>{
        try{
            const update:IRecipeComment = await this.recipeCommentModel.findByIdAndUpdate(comment._id,{comment:comment.comment,timeComment:new Date(),Is_Censored:false},{returnDocument:'after'})
            if (update) this.updateAtId(update)
            return update
        }catch(error){
            console.log(error)
            return null
        }
    }
    public findByRecipeId = (recipe_id:string):Array<IRecipeComment> | null=>{
        try{
            if ( !this.data || this.data.length == 0) return null
            const recipe:IRecipeComment[] = this.data.filter(data => {return data.Recipe_id.toString() == recipe_id})
            if (recipe.length <=0) return null
            else return recipe
        }catch(error){
            console.log(error)
            return null
        }
    }
    public getRecipeComment = async (_id:string):Promise<unknown>=>{
        try{
            return await this.recipeCommentModel.aggregate([
                {
                    $match:{_id:new Types.ObjectId(_id)}
                },
                {
                    $lookup:{
                        from:'files',
                        localField:'_id',
                        foreignField: 'RecipeComment_id',
                        as:'comment_files'
                    }
                },
                {
                    $project:{
                        _id:1,
                        Account_id:1,
                        Recipe_id:1,
                        comment:1,
                        files:'$comment_files.files'
                    }
                }
            ])
        }catch(error){
            console.log(error)
            return null
        }
    }
    public updateIsCensored = async (_id: string, Is_Censored: boolean): Promise<boolean> => {
        try {
          const cmt: IRecipeComment | null = await this.recipeCommentModel.findByIdAndUpdate(_id, { Is_Censored: Is_Censored })
          if (!cmt) return this.value.Fail()
          else {
            this.updateAtId(cmt)
            return this.value.Success()
          }
        } catch (error) {
          console.log(error)
          return this.value.Fail()
        }
      }
}