import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ArticleCommentRepository } from './articleComment/articleComment.repository';
import { IArticleComment } from './articleComment/articleComment.model';
import { ArticleComment, CreateArticleComment } from './dto/articleComment.dto';
import { UploadFile } from '../file/dto/file.dto';
import { ArticleRepository } from '../article/article.repository';
import { ConstValue } from '../../otherModule/shared/defaultValues';
import { FileService } from '../file/file.service';
import { FileRepository } from '../file/file.repository';
import { IFile } from '../file/file.model';
import { File } from '../file/dto/file.dto';
import { CreateRecipeComment, RecipeComment } from './dto/recipeComment.dto';
import { IRecipeComment } from './recipeComment/recipeComment.model';
import { RecipeCommentRepository } from './recipeComment/recipeComment.repository';
import { RecipeRepository } from '../recipe/recipe.repository';
import { NotificationService } from '../user/notification/notification.service';
import { IArticle } from '../article/article.model';
import { IRecipe } from '../recipe/recipe.model';
import { BadWordService } from '../algorithm/badword.service';

@Injectable()
export class CommentService {
    constructor(
        private readonly articleCommentRepository:ArticleCommentRepository,
        private readonly articleRepository:ArticleRepository,
        private readonly value:ConstValue,
        private readonly fileService:FileService,
        private readonly fileRepository:FileRepository,
        private readonly recipeCommentRepository:RecipeCommentRepository,
        private readonly recipeRepository:RecipeRepository,
        private readonly notificationService:NotificationService,
        private readonly badwordService:BadWordService
    ){}
    public createArticleComment = async (comment:CreateArticleComment, files?:Array<UploadFile>):Promise<IArticleComment | string[]>=>{
        try{
            if (!comment.Account_id || !comment.Article_id || !comment.comment) throw new HttpException('Missing information',HttpStatus.BAD_REQUEST)
            // check exitsted for user and article
            const article:IArticle = this.articleRepository.findById(comment.Article_id)
            if (!article) throw new HttpException('Information is invalid',HttpStatus.BAD_REQUEST)
            comment.timeComment = new Date()

            const badwords:Array<string> | null = this.badwordService.badword.search(comment.comment.toLowerCase())
            if (badwords.length > 0) return badwords
            // add cmt
            const data:IArticleComment | null = await this.articleCommentRepository.addNew(comment)
            if (data) new Promise(()=>{this.notificationService.createCommentNotification(comment.Account_id,article.title,article.userId.toString())})
            if (!data) return null                    //add new fail 
            else if (data && !files) return data      // add new successful without files
            else if (data && files) {      
                           // add new successful with files
                //notification
                const success:boolean = await this.fileService.createFileStoreForArticleComment(data._id.toString(), files)
                if (success) return data              // add files successful
                else {                                // add files failed => delete comment
                    await this.articleCommentRepository.delete(data._id.toString())
                    return null
                } 
            }
            else return null
        }catch(error){
            console.log(error)
            return null
        }
    }
    public updateArticleComment = async(updateArticle:ArticleComment, Account_id:string):Promise<boolean>=>{
        try{
            if ((this.articleCommentRepository.findById(updateArticle._id)).Account_id.toString() != Account_id) throw new HttpException('Cannot delete comment',HttpStatus.UNAUTHORIZED)
            const update:IArticleComment | null = await this.articleCommentRepository.updateById(updateArticle)
            return (update) ? this.value.Success() : this.value.Fail()
        }catch(error){
            console.log(error)
            return this.value.Fail()
        }
    }
    public getArticleComment = async (_id:string):Promise<unknown>=>{
        try{
            return await this.articleCommentRepository.getArticleComment(_id)
        }catch(error){
            console.log(error)
            return null
        }
    }
    public getRecipeComment = async (_id:string):Promise<IRecipeComment>=>{
        try{
            return this.recipeCommentRepository.findById(_id)
        }catch(error){
            console.log(error)
            return null
        }
    }
    public deleteArticleComment = async(_id:string, Account_id?:string):Promise<boolean>=>{
        try{
            if (Account_id && (this.articleCommentRepository.findById(_id)).Account_id.toString() != Account_id) throw new HttpException('Cannot delete comment',HttpStatus.UNAUTHORIZED)
            const deleteFiles:IFile | null | boolean = await this.fileRepository.findAndDeleteAtArticleComment_id(_id)
            if (typeof deleteFiles === 'boolean') return this.value.Fail()
            else{
                if (!await this.articleCommentRepository.delete(_id)){
                   const reAddData: File = { ArticleComment_id:deleteFiles.ArticleComment_id.toString() } 
                   await this.fileRepository.addNewFile(reAddData, deleteFiles.files)
                   return this.value.Fail()
                } 
            } 
            return this.value.Success()
        }catch(error){
            console.log(error)
            return this.value.Fail()
        }
    }
    public createRecipeComment = async (comment:CreateRecipeComment):Promise<IRecipeComment | string[]>=>{
        try{
            if (!comment.Account_id || !comment.Recipe_id || !comment.comment) throw new HttpException('Missing information',HttpStatus.BAD_REQUEST)
            // check exitsted for recipe
            const recipe:IRecipe = this.recipeRepository.findById(comment.Recipe_id)
            if (!recipe) throw new HttpException('Information is invalid',HttpStatus.BAD_REQUEST)
            comment.timeComment = new Date()
            const badwords:Array<string> | null = this.badwordService.badword.search(comment.comment.toLowerCase())
            if (badwords.length > 0) return badwords
            // add cmt
            const data:IRecipeComment | null = await this.recipeCommentRepository.addNew(comment)
            if (!data) return null                    //add new fail 
            else{
                new Promise(()=>{this.notificationService.createCommentNotification(comment.Account_id,recipe.title,recipe.User_id.toString())})
                return data 
            }      // add new successful 
        }catch(error){
            console.log(error)
            return null
        }
    }
    public updateRecipeComment = async(updateRecipe:RecipeComment, Account_id:string):Promise<boolean>=>{
        try{
            if ((this.recipeCommentRepository.findById(updateRecipe._id)).Account_id.toString() != Account_id) throw new HttpException('Cannot delete comment',HttpStatus.UNAUTHORIZED)
            const update:IRecipeComment | null = await this.recipeCommentRepository.updateById(updateRecipe)
            return (update) ? this.value.Success() : this.value.Fail()
        }catch(error){
            console.log(error)
            return this.value.Fail()
        }
    }
    public deleteRecipeComment = async(_id:string, Account_id?:string):Promise<boolean>=>{
        try{
            if (Account_id && (this.recipeCommentRepository.findById(_id)).Account_id.toString() != Account_id) throw new HttpException('Cannot delete comment',HttpStatus.UNAUTHORIZED)
            if (!await this.recipeCommentRepository.delete(_id))return this.value.Fail()
            else return this.value.Success()
        }catch(error){
            console.log(error)
            return this.value.Fail()
        }
    }
    public deleteAllCommentOfRecipe = async (recipe_id:string):Promise<boolean>=>{
        try{
            if (!recipe_id || !this.recipeRepository.findById(recipe_id)) throw new Error("Invalid information")
            //find list comments
            const comments:Array<IRecipeComment> | null = this.recipeCommentRepository.findByRecipeId(recipe_id)
            if (!comments) return this.value.Success()
            if (await this.recipeCommentRepository.deleteMany(comments)) return this.value.Success()
            else return this.value.Fail()
        }catch(error){
            console.log(error)
            return this.value.Fail()
        }
    }
}
