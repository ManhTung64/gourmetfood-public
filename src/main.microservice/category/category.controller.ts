import { Controller, Get, HttpStatus, Res, Post, Body, UploadedFile,UseInterceptors, Put, Patch, Delete, Param, UseGuards, Req } from '@nestjs/common';

import { CategoryService } from './category.service';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { CategoryWithId, BaseCategory } from './dto/category.dto';
import { Category } from './category.model';
import { AuthenticationGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { Role } from '../user/dto/user.dto';

@Controller('api/category')
export class CategoryController {
    constructor(protected readonly service: CategoryService) {
    }
    @Get('getall')
    public async getAll(@Res() res: Response) {
        try {
            const listCategory: Array<Category> | null = await this.service.getAll()
            return res.status(HttpStatus.OK).json({ success: true, listCategory })
        } catch (error) {
            console.log(error)
            return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Internal server error" })
        }
    }
    @Post('addnew')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.Admin)
    @UseInterceptors(FileInterceptor('image'))
    public async create(@Req() req:Request, @Body() newCategory: BaseCategory,@UploadedFile() file:Express.Multer.File, @Res() res:Response) {
        try {
            if (!file) return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "File not found" })
            else if (await this.service.checkExisted(newCategory.name, false)) return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "This category is existed" })
            newCategory.image = await this.service.uploadImage(file)
            const addedCategory: Category | null = await this.service.addNewCategory(newCategory)
            if (!addedCategory) return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Add failed" })
            else return res.status(HttpStatus.OK).json({ success: true, addedCategory, message: "Add successful" })
        } catch (error) {
            console.log(error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error" })
        }
    }
    @Patch('update')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.Admin)
    @UseInterceptors(FileInterceptor('image'))
    public async update (@Req() req:Request, @Body() updateCategory: CategoryWithId,@UploadedFile() file:Express.Multer.File, @Res() res:Response){
        try{
          if (updateCategory.name && await this.service.checkExisted(updateCategory.name,true)) return res.status(HttpStatus.BAD_REQUEST).json({success:false,message:"New category name is existed"})
          if (file) updateCategory.image = await this.service.uploadImage(file)
          const updatedCategory:Category | null = await this.service.updateCategory(updateCategory)
          if (!updatedCategory) return res.status(HttpStatus.BAD_REQUEST).json({success:false,message:"Update failed"})
          else return res.status(HttpStatus.OK).json({success:true,updatedCategory,message:"Update successful"})
        }catch(error){
          console.log(error)
          return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({success:false,message:"Internal server error"})
        }
      }
      @Delete('delete/:id')
      @UseGuards(AuthenticationGuard, RolesGuard)
      @Roles(Role.Admin)
      public async delete (@Req() req:Request, @Param('id') _id:string, @Res() res:Response){
        try{  
          // miss: check category k co cong thuc
          if (!await this.service.deleteCategory(_id)) return res.status(HttpStatus.BAD_REQUEST).json({success:false,message:"Delete failed"})
          else return res.status(HttpStatus.OK).json({success:true,_id, message:"Delete successful"})
        }catch(error){
          console.log(error)
          return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({success:false,message:"Internal server error"})
        }
      }
}
