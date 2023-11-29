import { Controller, Post, UploadedFiles, UseInterceptors, Body, Res, HttpStatus, Patch, Param, Delete, Get, UseGuards, Req, Inject } from '@nestjs/common';

import { ArticleService } from './article.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateArticle, DeleteArticle, SharedArticle, UpdateArticle } from './dto/article.dto';
import { Response,Request } from 'express';
import { ConstValue } from '../../otherModule/shared/defaultValues';
import { IArticle } from './article.model';
import { AuthenticationGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { Role } from '../user/dto/user.dto';
import { RedisService } from '../../otherModule/redis/redis.service';
import { Ads } from '../../sponsor.microservice/ads/ads.dto';

@Controller('api/article')
export class ArticleController {
    constructor(private readonly service:ArticleService, private readonly value:ConstValue,private readonly redisService:RedisService){
    }
    @Post('addNew')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.Sponsor,Role.User)
    @UseInterceptors(FilesInterceptor('files'))
    public async create (@Req() req:Request, @Body() body:CreateArticle, @UploadedFiles() files:Express.Multer.File[], @Res() res:Response){
        try{
            body.userId = req['user'].accountId
            const newArticle:IArticle | boolean |  Array<string> = (files.length > 0) ? await this.service.createNewArticle(body, Object.values(files)) : await this.service.createNewArticle(body)
            if (Array.isArray(newArticle)) return res.status(HttpStatus.BAD_REQUEST).json({success:false,message:"This article contains badword",badwords:newArticle})
            else if (newArticle == this.value.Fail()) return res.status(HttpStatus.BAD_REQUEST).json({success:false,message:"Add failed"})
            else{
                //pub redis to create sponsor post when role = sponsor
                if (req['user'].role == Role.Sponsor && typeof newArticle != 'boolean'){
                    const newAds:Ads = {Account_id:req['user'].accountId,Article_id:newArticle._id.toString()}
                    this.redisService.pubSponsor('sponsor-post',newAds)
                }
                return res.status(HttpStatus.OK).json({success:true, data:newArticle, message:"Add successful"})
            } 
        }catch(error){
            console.log(error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({success:this.value.Fail(),message:"Internal server error"})
        }
    }
    @Get('getlistforglobal')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.Sponsor,Role.User)
    public async getListForHome (@Req() req:Request, @Res() res:Response){
        try{
            const data:IArticle[] | boolean = await this.service.getListArticleForHome()
            if (typeof data === 'boolean') return res.status(HttpStatus.BAD_REQUEST).json({success:this.value.Fail,message:"Server error"})
            else if (data.length == 0) return res.status(HttpStatus.OK).json({success:this.value.Success,message:"Not found",data})
            else return res.status(HttpStatus.OK).json({success:this.value.Success, data})
        }catch(error){
            console.log(error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({success:this.value.Fail(),message:"Internal server error"})
        }
    }
    @Get('getlistforfollower')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.Sponsor,Role.User)
    public async getListForFollower (@Req() req:Request, @Res() res:Response){
        try{
            const data:IArticle[] | boolean = await this.service.getListArticleForFollowing(req['user'].accountId)
            if (typeof data === 'boolean') return res.status(HttpStatus.BAD_REQUEST).json({success:this.value.Fail,message:"Server error"})
            else if (data.length == 0) return res.status(HttpStatus.OK).json({success:this.value.Success,message:"Not found",data})
            else return res.status(HttpStatus.OK).json({success:this.value.Success, data})
        }catch(error){
            console.log(error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({success:this.value.Fail(),message:"Internal server error"})
        }
    }
    @Get('getlistforprofile/:_id')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.Sponsor,Role.User)
    public async getListForProfile (@Param('_id') _id:string,  @Req() req:Request, @Res() res:Response){
        try{
            const data:IArticle[] | boolean = await this.service.getListArticleForUser(_id)
            if (typeof data === 'boolean') return res.status(HttpStatus.BAD_REQUEST).json({success:this.value.Fail,message:"Server error"})
            else if (data.length == 0) return res.status(HttpStatus.OK).json({success:this.value.Success,message:"Not found",data})
            else return res.status(HttpStatus.OK).json({success:this.value.Success, data})
        }catch(error){
            console.log(error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({success:this.value.Fail(),message:"Internal server error"})
        }
    }
    @Get('getlistwithhashtag/:hashtag')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.Sponsor,Role.User)
    public async getListWithHashtag (@Param('hashtag') hashtag:string,  @Req() req:Request, @Res() res:Response){
        try{
            const data:IArticle[] | boolean = await this.service.getListArticleForHastagSearch(hashtag)
            if (typeof data === 'boolean') return res.status(HttpStatus.BAD_REQUEST).json({success:this.value.Fail,message:"Server error"})
            else if (data.length == 0) return res.status(HttpStatus.OK).json({success:this.value.Success,message:"Not found",data})
            else return res.status(HttpStatus.OK).json({success:this.value.Success, data})
        }catch(error){
            console.log(error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({success:this.value.Fail(),message:"Internal server error"})
        }
    }
    @Post('addnewshared')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.Sponsor,Role.User)
    public async createSharedArticle (@Req() req:Request, @Body() body:SharedArticle,@Res() res:Response){
        try{
            if (body.article.userId == body.ownerOfSharedArticle) return res.status(HttpStatus.BAD_REQUEST).json({success:false,message:"Cannot share your own article"})
            const newArticle:IArticle | boolean = await this.service.createNewSharedArticle(body.article)
            if (newArticle == this.value.Fail()) return res.status(HttpStatus.BAD_REQUEST).json({success:false,message:"Add failed"})
            else return res.status(HttpStatus.OK).json({success:true, newArticle, message:"Add successful"})
        }catch(error){
            console.log(error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({success:false,message:"Internal server error"})
        }
    }
    @Patch('update')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.Sponsor,Role.User)
    @UseInterceptors(FilesInterceptor('files'))
    public async update (@Body() body:UpdateArticle,@UploadedFiles() files:Express.Multer.File[],@Req() req:Request,@Res() res:Response){
        try{
            const updatedArticle:IArticle | Array<string> = await this.service.updateArticle(body,req['user'].accountId,files)
            if (Array.isArray(updatedArticle)) return res.status(HttpStatus.BAD_REQUEST).json({success:false,message:"This article contains badword"})
            else if (!updatedArticle) return res.status(HttpStatus.BAD_REQUEST).json({success:false,message:"Update failed"})
            else return res.status(HttpStatus.OK).json({success:true, updatedArticle, message:"Update successful"})
        }catch(error){
            console.log(error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({success:false,message:"Internal server error"})
        }
    }
    @Delete('delete/:_id')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.Sponsor,Role.User)
    public async delete (@Param() _id:DeleteArticle,@Req() req:Request, @Res() res:Response){
        try{
            if (await this.service.deleteArticle(_id._id, req['user'].accountId) == this.value.Fail()) return res.status(HttpStatus.BAD_REQUEST).json({success:false,message:"Delete failed"})
            else return res.status(HttpStatus.OK).json({success:true, message:"Delete successful"})
        }catch(error){
            console.log(error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({success:false,message:"Internal server error"})
        }
    }
}
