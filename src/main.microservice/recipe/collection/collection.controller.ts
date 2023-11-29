import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { Request, Response } from 'express';
import { ConstValue } from '../../../otherModule/shared/defaultValues';
import { CreateCollection, RemoveCollection, UpdateCollection } from '../dto/collection.dto';
import { ICollection } from './collection.model';
import { CreateSaveRecipe, RemoveSaveRecipe } from '../dto/saveRecipe.dto';
import { ISaveRecipe } from '../saveRecipe/saveRecipe.model';
import { AuthenticationGuard } from '../../auth/auth.guard';
import { RolesGuard } from '../../auth/role.guard';
import { Roles } from '../../auth/role.decorator';
import { Role } from '../../user/dto/user.dto';

@Controller('api/collection')
export class CollectionController {
    constructor(private readonly service:CollectionService,
        private readonly value:ConstValue
        ){

    }
    @Post('addcollection')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.Sponsor,Role.User)
    public async addCollection (@Body() body:CreateCollection,@Req() req:Request, @Res() res:Response){
        try{
            const success:ICollection | null = await this.service.addCollection(body)
            if (success) return res.status(HttpStatus.OK).json({success:this.value.Success(),collection:success})
            else return res.status(HttpStatus.BAD_REQUEST).json({success:this.value.Fail(),message:"Add failed"})
        }catch(error){
            console.log(error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: this.value.Fail(), message: "Internal server error" })
        }
    }
    @Patch('updatecollection')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.Sponsor,Role.User)
    public async updateCollection (@Body() body:UpdateCollection,@Req() req:Request, @Res() res:Response){
        try{
            const success:ICollection | null = await this.service.updateCollectionName(body)
            if (success) return res.status(HttpStatus.OK).json({success:this.value.Success(),collection:success})
            else return res.status(HttpStatus.BAD_REQUEST).json({success:this.value.Fail(),message:"Update failed"})
        }catch(error){
            console.log(error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: this.value.Fail(), message: "Internal server error" })
        }
    }
    @Delete('deletecollection')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.Sponsor,Role.User)
    public async deleteCollection (@Body() body:RemoveCollection,@Req() req:Request, @Res() res:Response){
        try{
            const success:boolean = await this.service.deleteCollection(body)
            if (success) return res.status(HttpStatus.OK).json({success:this.value.Success(),deletedCollection:body})
            else return res.status(HttpStatus.BAD_REQUEST).json({success:this.value.Fail(),message:"Delete failed"})
        }catch(error){
            console.log(error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: this.value.Fail(), message: "Internal server error" })
        }
    }
    @Post('saveRecipeCollection')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.Sponsor,Role.User)
    public async saveRecipe (@Body() body:CreateSaveRecipe,@Req() req:Request, @Res() res:Response){
        try{
            const success:ISaveRecipe | null = await this.service.addToCollection(body)
            if (success) return res.status(HttpStatus.OK).json({success:this.value.Success(),recipe:success})
            else return res.status(HttpStatus.BAD_REQUEST).json({success:this.value.Fail(),message:"Add failed"})
        }catch(error){
            console.log(error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: this.value.Fail(), message: "Internal server error" })
        }
    }
    @Delete('deleteSaveRecipe')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.Sponsor,Role.User)
    public async deleteSaveRecipe (@Body() body:RemoveSaveRecipe,@Req() req:Request, @Res() res:Response){
        try{
            const success:boolean = await this.service.RemoveToCollection(body,req['user'].Account_id)
            if (success) return res.status(HttpStatus.OK).json({success:this.value.Success(),deletedRecipe:body})
            else return res.status(HttpStatus.BAD_REQUEST).json({success:this.value.Fail(),message:"Delete failed"})
        }catch(error){
            console.log(error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: this.value.Fail(), message: "Internal server error" })
        }
    }
    @Get("getcollection")
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.Sponsor,Role.User)
    public async getCollection (@Req() req:Request, @Res() res:Response){
        try{
            const success:ICollection[] = this.service.getAllCollection(req['user'].accountId)
            if (success && success.length > 0) return res.status(HttpStatus.OK).json({success:this.value.Success(),collections:success})
            else return res.status(HttpStatus.BAD_REQUEST).json({success:this.value.Fail(),message:"Not found"})
        }catch(error){
            console.log(error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: this.value.Fail(), message: "Internal server error" })
        }
    }
    @Get("getbycollection/:_id")
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.Sponsor,Role.User)
    public async getByCollection (@Param("_id") _id:string,@Req() req:Request, @Res() res:Response){
        try{
            const success:ICollection[] = await this.service.getAllRecipeByCollection(_id,req['user'].accountId)
            if (success && success.length > 0) return res.status(HttpStatus.OK).json({success:this.value.Success(),collections:success})
            else return res.status(HttpStatus.BAD_REQUEST).json({success:this.value.Fail(),message:"Not found"})
        }catch(error){
            console.log(error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: this.value.Fail(), message: "Internal server error" })
        }
    }
    // @Get("getrecipe/:_id")
    // @UseGuards(AuthenticationGuard, RolesGuard)
    // @Roles(Role.Sponsor,Role.User)
    // public async getRecipe (@Param("_id") _id:string,@Req() req:Request, @Res() res:Response){
    //     try{
    //         const success:ISaveRecipe = await this.service.getRecipe(_id)
    //         if (success) return res.status(HttpStatus.OK).json({success:this.value.Success(),collections:success})
    //         else return res.status(HttpStatus.BAD_REQUEST).json({success:this.value.Fail(),message:"Not found"})
    //     }catch(error){
    //         console.log(error)
    //         return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: this.value.Fail(), message: "Internal server error" })
    //     }
    // }
}
