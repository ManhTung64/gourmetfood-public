import { Body, Controller, Post, UseInterceptors, UploadedFiles, Res, HttpStatus, Delete, UseGuards, Req, Patch } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response, Request } from 'express';
import { ArticleComment, CreateArticleComment, DeleteCommentData } from './dto/articleComment.dto';
import { ConstValue } from '../../otherModule/shared/defaultValues';
import { CommentService } from './comment.service';
import { IArticleComment } from './articleComment/articleComment.model';
import { AuthenticationGuard } from '../auth/auth.guard';
import { CreateRecipeComment, RecipeComment } from './dto/recipeComment.dto';
import { IRecipeComment } from './recipeComment/recipeComment.model';
import { RolesGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { Role } from '../user/dto/user.dto';

@Controller('api/comment')
export class CommentController {
    constructor(private readonly value:ConstValue, private readonly service:CommentService){

    }
    @Post('addComment')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.Sponsor,Role.User)
    @UseInterceptors(FilesInterceptor('files'))
    public async addNew(@Body() body:CreateArticleComment,@Req() req:Request, @UploadedFiles() files:Express.Multer.File[], @Res() res:Response){
        try{
            body.Account_id = req['user'].accountId
            const success:IArticleComment | string[] = (files.length > 0)? await this.service.createArticleComment(body, files) : await this.service.createArticleComment(body)
            if (Array.isArray(success)) return res.status(HttpStatus.BAD_REQUEST).json({success:this.value.Fail(),message:"This content contains badword"})
            else if (success) return res.status(HttpStatus.OK).json({success:this.value.Success(), message:"add Succesful", data:success})
            else return res.status(HttpStatus.BAD_REQUEST).json({success:this.value.Fail(), message:"add Fail"})
        }catch(error){
            console.log(error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({success:this.value.Fail(), message:"Internal server error"})
        }
    }
    @Patch('updateComment')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.Sponsor,Role.User)
    @UseInterceptors(FilesInterceptor('files'))
    public async update(@Body() body:ArticleComment, @UploadedFiles() files:Express.Multer.File[],@Req() req:Request, @Res() res:Response){
        try{
            // file process
            const success:boolean = await this.service.updateArticleComment(body, req['user'].Account_id)
            if (success) return res.status(HttpStatus.OK).json({success, message:"update Succesful",data:body._id})
            else return res.status(HttpStatus.BAD_REQUEST).json({success, message:"update Failed"})
        }catch(error){
            console.log(error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({success:this.value.Fail(), message:"Internal server error"})
        }
    }
    @Delete('deleteComment')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.Sponsor,Role.User)
    public async deleteComment(@Body() body:DeleteCommentData,@Req() req:Request, @Res() res:Response){
        try{
            const success:boolean = await this.service.deleteArticleComment(body._id,req['user'].accountId)
            if (success) return res.status(HttpStatus.OK).json({success,message:"Delete successful",data:body._id})
            else return res.status(HttpStatus.BAD_REQUEST).json({success, message:"Delete failed"})
        }catch(error){
            console.log(error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({success:this.value.Fail(), message:"Internal server error"})
        }
    }
    @Post('addRecipeComment')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.Sponsor,Role.User)
    public async addNewRecipeComment(@Body() body:CreateRecipeComment, @Req() req:Request,  @Res() res:Response){
        try{
            const success:IRecipeComment | string[] = await this.service.createRecipeComment(body)
            if (Array.isArray(success)) return res.status(HttpStatus.BAD_REQUEST).json({success:this.value.Fail(),message:"This content contains badword"})
            else if (success) return res.status(HttpStatus.OK).json({success:this.value.Success(), message:"add Succesful", data:success})
            else return res.status(HttpStatus.BAD_REQUEST).json({success:this.value.Fail(), message:"add Fail"})
        }catch(error){
            console.log(error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({success:this.value.Fail(), message:"Internal server error"})
        }
    }
    @Patch('updateRecipeComment')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.Sponsor,Role.User)
    public async updateRecipeComment(@Body() body:RecipeComment,@Req() req:Request, @Res() res:Response){
        try{
            const success:boolean = await this.service.updateRecipeComment(body, req['user'].Account_id)
            if (success) return res.status(HttpStatus.OK).json({success, message:"update Succesful",data:body._id})
            else return res.status(HttpStatus.BAD_REQUEST).json({success, message:"update Failed"})
        }catch(error){
            console.log(error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({success:this.value.Fail(), message:"Internal server error"})
        }
    }
    @Delete('deleteRecipeComment')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.Sponsor,Role.User)
    public async deleteRecipeComment(@Body() body:DeleteCommentData,@Req() req:Request, @Res() res:Response){
        try{
            const success:boolean = await this.service.deleteRecipeComment(body._id,req['user'].accountId)
            if (success) return res.status(HttpStatus.OK).json({success,message:"Delete successful",data:body._id})
            else return res.status(HttpStatus.BAD_REQUEST).json({success, message:"Delete failed"})
        }catch(error){
            console.log(error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({success:this.value.Fail(), message:"Internal server error"})
        }
    }
}

