import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Article, CreateArticle, SharedArticle, UpdateArticle } from './dto/article.dto';
import { IArticle } from './article.model';
import { ArticleRepository } from './article.repository';
import { UploadFile } from '../file/dto/file.dto';
import { ConstValue } from '../../otherModule/shared/defaultValues';
import { UserService } from '../user/user.service';
import { FileService } from '../file/file.service';
import { BadWordService } from '../algorithm/badword.service';
import { error } from 'console';
import { IFile } from '../file/file.model';
import { NotificationService } from '../user/notification/notification.service';
import { resolve } from 'path';
import { rejects } from 'assert';
import { IUser } from '../user/user.model';
import { IFollow } from '../user/follow/follow.model';
import { FollowService } from '../user/follow/follow.service';
import { ObjectId, Types } from 'mongoose';

@Injectable()
export class ArticleService {
    constructor( private readonly repository:ArticleRepository, 
        private readonly value:ConstValue,
        private readonly userService:UserService,
         private readonly fileService:FileService,
         private readonly badwordService:BadWordService,
         private readonly notificationService:NotificationService,
         private readonly followService:FollowService
        ){}
    public createNewArticle = async (article:CreateArticle,files?:Array<UploadFile>):Promise<IArticle | boolean | Array<string>>=>{
        try{
            //validate
            if (!article.content || !article.title || !article.userId) throw new HttpException("Missing information",HttpStatus.BAD_REQUEST)
            //set time upload
            article.timeUpload = new Date()
            if (!await this.userService.FindAccountById(article.userId.toString())) return this.value.Fail()
            // get hashtag
            article.hashtag = this.getHashtagFromText(article.content)
            // consore article
            const badwords:Array<string> | null = this.badwordService.badword.search(article.content.toLowerCase() 
            + ' ' + article.title.toLowerCase())
            if (badwords.length > 0)return badwords
            //add article
            const newArticle:IArticle | null = await this.repository.addNew(article)
            if (!newArticle) return this.value.Fail()
            else {  
                // add files
                new Promise((resolve,reject)=>{this.notificationService.createFollowingUploadArticleNotification(article.userId)})
                if (files && newArticle._id){
                    if (!await this.fileService.createFileStoreForArticle(newArticle._id.toString(),files)) await this.repository.delete(newArticle._id.toString())
                    else return newArticle
                } 
                else if (!files) return newArticle
                return this.value.Fail()
            }
        }catch(error){
            console.log(error)
            return this.value.Fail()
        }
    }
    public createNewSharedArticle = async (article:Article):Promise<IArticle | boolean>=>{
        try{
            if (!article.content || !article.title || !article.userId || !article.Article_id) throw new Error("Missing information")
            article.timeUpload = new Date()
            if (!await this.userService.FindAccountById(article.userId.toString()) || !await this.checkExisted(article.Article_id.toString())) return this.value.Fail()
            article.hashtag = this.getHashtagFromText(article.content)
            article.isShared = true
            const newArticle:IArticle | null = await this.repository.addNew(article)
            return newArticle ? newArticle : this.value.Fail()
        }catch(error){
            console.log(error)
            return this.value.Fail()
        }
    }
    public checkExisted = async (_id:string):Promise<boolean> => {
        try{
            if (!_id) throw new Error("Missing information")
            if (this.repository.findById(_id)) return this.value.Existed()
            else return this.value.NotExisted()
        }catch(error){
            console.log(error)
            return this.value.Fail()
        }
    }
    private getHashtagFromText = (content:string):string=>{
        try{
            let hashtags = content.match(/#[^\s#]+/g)
            return (hashtags)? hashtags.join('') : ""
        }catch(error){
            return ""
        }
    }
    public findArticleById = async (_id:string):Promise<IArticle | null>=>{
        try{
            if (!_id) throw new Error("Missing information")
            return this.repository.findById(_id)  
        }catch(error){
            console.log(error)
            return null
        }
    }
    public updateArticle = async (updateArticle:UpdateArticle, userId:string,files?:Array<UploadFile>):Promise<IArticle | Array<string>>=>{
        try{
            //check ex
            const article:IArticle = this.repository.findById(updateArticle._id)
            if (!article) return null
            else if (userId != article.userId.toString()) return null
            //check badwords
            if (updateArticle.content) var badwords:Array<string> | null = this.badwordService.badword.search(updateArticle.content.toLowerCase())
            if (badwords && badwords.length > 0) return badwords
            //change files in database
            if (this.fileService.findDataByArticleId(updateArticle._id))var isSuccess:boolean = await this.fileService.compareAndChangeFile(updateArticle._id,updateArticle.oldFiles,true,false)
            if (typeof isSuccess === 'boolean' && !isSuccess) throw new Error("Update file failed")
            // new file processing
            if (files.length > 0){
                if (files.length != updateArticle.newFileIndex.length) return null
                if (!await this.fileService.updateFile(updateArticle._id,files,updateArticle.newFileIndex,true,false)) 
                throw new Error("update file for update article failed")
            } 
            //get hashtag
            if (updateArticle.content) article.hashtag = this.getHashtagFromText(article.content)
            // update
            return await this.repository.updateArticleById(updateArticle)
        }catch(error){
            console.log(error)
            return null
        }
    }
    public deleteArticle = async (_id:string, user_Id?:string):Promise<boolean>=>{
        try{
            //check userId, if  has not (admin role) else has userId => userdelete
            const article:IArticle = this.repository.findById(_id)
            if (!_id) return this.value.Fail()
            else if (user_Id && article.userId.toString() != user_Id) return this.value.Fail()
            if (await this.fileService.deleteFileOfArticle(_id) && await this.repository.deleteArticleById(_id)){
                //send notification when not userId (delete with admin role)
                if (!user_Id) new Promise(()=>{this.notificationService.createReportNotification(article.title,article.userId.toString())})
                return this.value.Success()
            } 
            else return this.value.Fail()
        }catch(error){
            console.log(error)
            return this.value.Fail()
        }
    }
    public getListArticleForHome = async ():Promise<IArticle[] | boolean>=>{
        try{
            return await this.repository.getListArticleForGlobal()
        }catch(error){
            console.log(error)
            return this.value.Fail()
        }
    }
    public getListArticleForUser = async (_id:string):Promise<IArticle[] | boolean>=>{
        try{
            if (!this.userService.FindAccountById(_id)) return null
            return await this.repository.getListArticleForUser(_id)
        }catch(error){
            console.log(error)
            return this.value.Fail()
        }
    }
    public getListArticleForFollowing = async (_id:string):Promise<IArticle[] | boolean>=>{
        try{
            if (!this.userService.FindAccountById(_id)) return null
            const listfollow:IFollow[] = this.followService.getFollowings(_id)
            if (!listfollow || listfollow.length == 0) return null
            const listFollowing:Types.ObjectId[] = []
            listfollow.map((following)=>{ listFollowing.push(new Types.ObjectId(following.following_id.toString())) })
            return await this.repository.getListArticleForFollowing(listFollowing)
        }catch(error){
            console.log(error)
            return this.value.Fail()
        }
    }
    public getListArticleForHastagSearch = async (hashtag:string):Promise<IArticle[] | boolean>=>{
        try{
            return await this.repository.getListArticleForHashtag(hashtag)
        }catch(error){
            console.log(error)
            return this.value.Fail()
        }
    }
}
