import { Repository } from "../../../base/base.repository";
import { IReport } from "./report.model";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";

@Injectable()
export class ReportRepository extends Repository<IReport>{
    constructor(@InjectModel('Report') private readonly reportModel:Model<IReport>){
        super(reportModel)
    }
    public findByArticle_id = (Article_id:string, Account_id:string):IReport | null=>{
        try{
            const find:IReport[] = this.data.filter(report => {
                return report.Article_id.toString() === Article_id && report.Account_id.toString() === Account_id})
            if (find.length >= 1 ) return find[0]
            else return null
        }catch(error){
            console.log(error)
            return null
        }
    }
    public findByArticleComment_id = (ArticleComment_id:string, Account_id:string):IReport | null=>{
        try{
            const find:IReport[] = this.data.filter(report => {
                return report.ArticleComment_id.toString() === ArticleComment_id && report.Account_id.toString() === Account_id})
            if (find.length >= 1 ) return find[0]
            else return null
        }catch(error){
            console.log(error)
            return null
        }
    }
    public findByRecipe_id = (Recipe_id:string, Account_id:string):IReport | null=>{
        try{
            const find:IReport[] = this.data.filter(report => {
                return report.Recipe_id.toString() === Recipe_id && report.Account_id.toString() === Account_id})
            if (find.length >= 1 ) return find[0]
            else return null
        }catch(error){
            console.log(error)
            return null
        }
    }
    public findByRecipeComment_id = (RecipeComment_id:string, Account_id:string):IReport | null=>{
        try{
            const find:IReport[] = this.data.filter(report => {
                return report.RecipeComment_id.toString() === RecipeComment_id && report.Account_id.toString() === Account_id})
            if (find.length >= 1 ) return find[0]
            else return null
        }catch(error){
            console.log(error)
            return null
        }
    }
    public deleteByArticle_id = async(_id:string):Promise<IReport | null>=>{
        try{
            const success:IReport | null = await this.reportModel.findOneAndDelete({Article_id:_id})
            if (success) this.updateAtId(success,true)
            return success
        }catch(error){
            console.log(error)
            return null
        }
    }
    public findArticleReports = async():Promise<IReport[]>=>{
        try{
            return await this.reportModel.aggregate([
                {
                    $lookup:{
                        from:'users',
                        localField:'Account_id',
                        foreignField:'_id',
                        as:'userReport'
                    }
                },{
                    $lookup:{
                        from:'articles',
                        localField:'Article_id',
                        foreignField:'_id',
                        as:'article'
                    }
                },{
                    $lookup:{
                        from:'files',
                        localField:'article._id',
                        foreignField:'Article_id',
                        as:'files'
                    }
                },{
                    $lookup:{
                        from:'users',
                        localField:'article.userId',
                        foreignField:'_id',
                        as:'userPost'
                    }
                },{
                    $project:{
                        _id:1,
                        userReport:'$userReport',
                        article:'$article',
                        userPost:'$userPost',
                        files:'$files.files'
                    }
                }
            ])
        }catch(error){
            console.log(error)
            return null
        }
    }
    public findRecipeReports = async():Promise<IReport[]>=>{
        try{
            return await this.reportModel.aggregate([
                {
                    $lookup:{
                        from:'recipes',
                        localField:'Recipe_id',
                        foreignField:'_id',
                        as:'recipe'
                    }
                },
                {
                    $lookup:{
                        from:'users',
                        localField:'Account_id',
                        foreignField:'_id',
                        as:'userReport'
                    }
                },{
                    $lookup:{
                        from:'users',
                        localField:'recipe.User_id',
                        foreignField:'_id',
                        as:'userPost'
                    }
                },{
                    $project:{
                        _id:1,
                        userReport:'$userReport',
                        recipe:'$recipe',
                        userPost:'$userPost'
                    }
                }
            ])
        }catch(error){
            console.log(error)
            return null
        }
    }
}