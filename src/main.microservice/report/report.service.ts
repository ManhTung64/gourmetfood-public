import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ReportRepository } from './report.repository';
import { ArticleRepository } from '../article/article.repository';
import { IReport } from './report.model';
import { IArticle } from '../article/article.model';
import { BadWordService } from '../algorithm/badword.service';
import { CreateReport } from './dto/articleReport.dto';
import { ArticleService } from '../article/article.service';
import { ConstValue } from '../../otherModule/shared/defaultValues';
import { ArticleCommentRepository } from '../comment/articleComment/articleComment.repository';
import { CommentService } from '../comment/comment.service';
import { IArticleComment } from '../comment/articleComment/articleComment.model';
import { RecipeCommentRepository } from '../comment/recipeComment/recipeComment.repository';
import { IRecipeComment } from '../comment/recipeComment/recipeComment.model';
import { RecipeService } from '../recipe/recipe.service';
import { RecipeRepository } from '../recipe/recipe.repository';
import { IRecipe } from '../recipe/recipe.model';
import { NotificationService } from '../user/notification/notification.service';
import { resolve } from 'path';

@Injectable()
export class ReportService {
    constructor(private readonly reportRepository:ReportRepository, private readonly articleRepository:ArticleRepository,
        private readonly badwordService:BadWordService, private readonly articleService:ArticleService,
        private readonly value:ConstValue, private readonly commentService:CommentService, 
        private readonly articleCommentRepository:ArticleCommentRepository,
        private readonly recipeCommentRepository:RecipeCommentRepository,
        private readonly recipeService:RecipeService,
        private readonly recipeRepository:RecipeRepository,
        private readonly notificationService:NotificationService
        ){
    }
    public addNewReport = async (_id:string, Account_id:string, isArticle:boolean, isComment:boolean):Promise<IReport | null>=>{
        try{
            if (!_id || !Account_id || !isArticle == null || isComment == null) throw new Error("Missing information")
            let newReport:CreateReport
            if (isArticle){
                if (!isComment){ // article 
                    newReport = await this.addArticleReport(_id,Account_id)
                    if (!newReport) throw new Error("Error")
                } 
            }
            return await this.reportRepository.addNew(newReport)
        }catch(error){
            console.log(error)
            return null
        }
    }
    private addArticleReport = async (_id:string, Account_id:string):Promise<CreateReport | null>=>{
        try{
            //find article
            const article:IArticle | null = this.articleRepository.findById(_id)
            if (!article) throw new Error("Article is not existed")
            else if (Account_id == article.userId.toString()) throw new Error("Cannot report my article")
            // find bad word
            if (this.isContainedBadWord(article.content)) await this.articleService.deleteArticle(article._id.toString())

            if (this.reportRepository.findByArticle_id(_id,Account_id)) throw new Error("This article is reported")
            else return {Account_id:Account_id, Article_id:_id}
        }catch(error){
            console.log(error)
            return null
        }
    }
    private isContainedBadWord = (string:string):boolean=>{
        try{
            const badwords: Array<string> | null = this.badwordService.badword.search(string)
            if (badwords.length > 0) return this.value.Existed()
            else return this.value.NotExisted()
        }catch(error){
            console.log(error)
            return this.value.Fail()
        }
    }
    public confirmReport = async (_id:string,pass:boolean, badwords?:string[]):Promise<boolean>=>{
        try{
            if (!_id || !badwords) throw new Error("Missing information")
            if (badwords.length > 0) this.badwordService.addManyBadWord(badwords)
            const report:IReport | null = this.reportRepository.findById(_id)
            if (!report) throw new Error("Not existed")
            if (report.Article_id){
                //article
                if (!report.ArticleComment_id && await this.articleReport(_id,report.Article_id.toString(), pass)) return this.value.Success()
                // article comment
                else if (report.ArticleComment_id && await this.articleCommentReport(_id,report.ArticleComment_id.toString(), pass))return this.value.Success()
                else return this.value.Fail()
            }   else if (report.Recipe_id){
                // recipe comment
                if (report.RecipeComment_id && await this.recipeCommentReport(_id,report.RecipeComment_id.toString(),pass))return this.value.Success()
                //recipe 
                else if (!report.RecipeComment_id && await this.recipeReport(_id,report.Recipe_id.toString(),pass)) return this.value.Success()
                else return this.value.Fail()
            }
        }catch(error){
            console.log(error)
            return this.value.Fail()        
        }
    }
    private articleReport = async (_id:string,article_id:string, valid:boolean):Promise<boolean>=>{
        try{
            //find article
            const article:IArticle | null = this.articleRepository.findById(article_id)
            if (!article) throw new Error("Article is not existed")
            //delete report
            const report:IReport | null = await this.reportRepository.deleteAndGet(_id)
            if (article && report && valid) new Promise(()=>{this.notificationService.createReportNotification(article.title,report.Account_id.toString())})
            // delete article
            if (report && valid  && await this.articleService.deleteArticle(_id) ) return this.value.Success()
            //change censored state = true
            else if (report && !valid && await this.articleRepository.updateIsCensored(_id,!valid)) return this.value.Success()
            else{
                await this.reportRepository.addNew(report)
                return this.value.Success()
            } 
            
        }catch(error){
            console.log(error)
            return this.value.Fail()        
        }
    }
    private recipeReport = async (_id:string,recipe_id:string, valid:boolean):Promise<boolean>=>{
        try{
            //find recipe
            const recipe:IRecipe | null = this.recipeRepository.findById(recipe_id)
            if (!recipe) throw new Error("Recipe is not existed")
            //delete report
            const report:IReport | null = await this.reportRepository.deleteAndGet(_id)
            if (recipe && report) new Promise((resolve)=>{this.notificationService.createReportNotification(recipe.title,report.Account_id.toString())})
            // delete recipe
            if (report && await this.recipeService.deleteRecipeWithId(recipe_id) && valid) return this.value.Success()
            //change censored state = true
            else if (report && !valid && await this.recipeRepository.updateIsCensored(_id,!valid)) return this.value.Success()
            else{
                await this.reportRepository.addNew(report)
                return this.value.Success()
            } 
        }catch(error){
            console.log(error)
            return this.value.Fail()        
        }
    }
    private articleCommentReport = async (_id:string,articleComment_id:string, valid:boolean):Promise<boolean>=>{
        try{
            //find articleComment
            const articlecomment:IArticleComment | null = this.articleCommentRepository.findById(articleComment_id)
            if (!articlecomment) throw new Error("Article comment is not existed")
            //delete report
            const report:IReport | null = await this.reportRepository.deleteAndGet(_id)
            if (articlecomment && report) new Promise(()=>{this.notificationService.createReportNotification(articlecomment.comment,report.Account_id.toString())})
            // delete articleComment
            if (report && await this.commentService.deleteArticleComment(_id) && valid) return this.value.Success()
            //change censored state = true
            else if (report && !valid && await this.articleCommentRepository.updateIsCensored(_id,!valid)) return this.value.Success()
            else{
                await this.reportRepository.addNew(report)
                return this.value.Success()
            }
        }catch(error){
            console.log(error)
            return this.value.Fail()        
        }
    }
    private recipeCommentReport = async (_id:string,recipeComment_id:string, valid:boolean):Promise<boolean>=>{
        try{
            //find recipeComment
            const comment:IRecipeComment | null = this.recipeCommentRepository.findById(recipeComment_id)
            if (!comment) throw new Error("recipe comment is not existed")
            //delete report
            const report:IReport | null = await this.reportRepository.deleteAndGet(_id)
            if (comment && report) new Promise((resolve)=>{this.notificationService.createReportNotification(comment.comment,report.Account_id.toString())})
            // delete recipeComment
            if (report && await this.commentService.deleteRecipeComment(_id) && valid) return this.value.Success()
            //change censored state = true
            else if (report && !valid && await this.recipeCommentRepository.updateIsCensored(_id,!valid)) return this.value.Success()
            else{
                await this.reportRepository.addNew(report)
                return this.value.Success()
            }
        }catch(error){
            console.log(error)
            return this.value.Fail()        
        }
    }
    public getArticleReports = async():Promise<IReport[]>=>{
        try{
            return this.reportRepository.findArticleReports()
        }catch(error){
            console.log(error)
            return null
        }
    }
    public getRecipeReports = async():Promise<IReport[]>=>{
        try{
            return this.reportRepository.findRecipeReports()
        }catch(error){
            console.log(error)
            return null
        }
    }
}
