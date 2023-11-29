import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Req, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { ConstValue } from '../../otherModule/shared/defaultValues';
import { Response, Request } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { GetParam, Recipe, StepBeforeUpload } from './dto/recipe.dto';
import { UploadFile } from '../file/dto/file.dto';
import { IRecipe } from './recipe.model';
import { AuthenticationGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { Role } from '../user/dto/user.dto';

@Controller('api/recipe')
export class RecipeController {
    constructor(private readonly service: RecipeService, private readonly value: ConstValue) { }
    @Get('getone/:_id')
    public async getOneRecipe (@Param() param:GetParam, @Res() res:Response){
        try{
            const data:unknown = await this.service.getOneRecipe(param._id)
            if (data != null) return res.status(HttpStatus.OK).json({success:this.value.FindOut(), data})
            else return res.status(HttpStatus.NOT_FOUND).json({success:this.value.NotFound(), message:"Not found"})
        }catch(error){
            console.log(error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: this.value.Fail(), message: "Internal server error" })
        }
    }
    @Post('addnew')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.Sponsor,Role.User)
    @UseInterceptors(FilesInterceptor('files'))
    public async create(@Req() req:Request, @Body() body:Recipe,@UploadedFiles() files:Express.Multer.File[],@Res() res: Response) {
        try {
            //fake data
            body.ingredients = JSON.parse(body.ingredientsString)
            body.steps = JSON.parse(body.stepsString)
            if (files.length > 0) {
                var arr: Array<UploadFile> = Object.values(files)
                body.User_id = req['user'].accountId
                const recipe: IRecipe | string[] = await this.service.createNewRecipe(body, body.steps, arr)
                if (Array.isArray(recipe)) return res.status(HttpStatus.BAD_REQUEST).json({success:this.value.Fail(),message:"This content contains badword"})
                else if (recipe) return res.status(HttpStatus.OK).json({ success: this.value.Success(), recipe })
                else return res.status(HttpStatus.BAD_REQUEST).json({ success: this.value.Fail(), message: "Add failed" })
            }
            else return res.status(HttpStatus.BAD_REQUEST).json({ success: this.value.Fail(), message: "Missing file" })
        } catch (error) {
            console.log(error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: this.value.Fail(), message: "Internal server error" })
        }
    }
    @Delete('delete/:_id')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.Sponsor,Role.User)
    public async delete (@Req() req:Request, @Param('_id') _id:string,@Res() res: Response){
        try {
            if (!_id) return res.status(HttpStatus.BAD_REQUEST).json({ success: this.value.Fail(), message: "Missing information" })
            if (await this.service.deleteRecipeWithId(_id)) return res.status(HttpStatus.OK).json({ success: this.value.Success() })
            else return res.status(HttpStatus.BAD_REQUEST).json({ success: this.value.Fail(), message: "Delete failed" })
        } catch (error) {
            console.log(error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: this.value.Fail(), message: "Internal server error" })
        }
    }
    @Get('getall')
    public async getAllRecipe (@Res() res:Response){
        try{
            const data:unknown = await this.service.getAllRecipe()
            if (data != null) return res.status(HttpStatus.OK).json({success:this.value.FindOut(), data})
            else return res.status(HttpStatus.NOT_FOUND).json({success:this.value.NotFound(), message:"Not found"})
        }catch(error){
            console.log(error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: this.value.Fail(), message: "Internal server error" })
        }
    }
    @Get('getallbyuser')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.Sponsor,Role.User)
    public async getAllRecipeByUser (@Req() req:Request, @Res() res:Response){
        try{
            const data:IRecipe[] = await this.service.getRecipesByUser(req['user'].accountId)
            if (data != null) return res.status(HttpStatus.OK).json({success:this.value.FindOut(), data})
            else return res.status(HttpStatus.NOT_FOUND).json({success:this.value.NotFound(), message:"Not found"})
        }catch(error){
            console.log(error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: this.value.Fail(), message: "Internal server error" })
        }
    }
    @Get('getallbycategory/:name')
    public async getAllRecipeByCategory (@Req() req:Request,@Param('name') category:string, @Res() res:Response){
        try{
            const data:IRecipe[] = await this.service.getAllRecipe(category)
            if (data != null) return res.status(HttpStatus.OK).json({success:this.value.FindOut(), data})
            else return res.status(HttpStatus.NOT_FOUND).json({success:this.value.NotFound(), message:"Not found"})
        }catch(error){
            console.log(error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: this.value.Fail(), message: "Internal server error" })
        }
    }
    @Get('gettoptrendingrecipe')
    public async getTopTrendingRecipe (@Req() req:Request, @Res() res:Response){
        try{
            let [topTrending,listCategory, categoryRating,topUser,topCollections] = await Promise.all([
                this.service.getRecipesWithAvgRating(),
                this.service.getListCategory(),
                this.service.findRatingOfAllCategoryRaw(),
                this.service.findUserWithRatingAvg(),
                this.service.findTopCollectionRecipe()
            ])
            categoryRating = categoryRating.sort((a,b)=>b.ratingCount-a.ratingCount)
            categoryRating = categoryRating.filter((category)=>{return category.avg >= 3}).slice(0,4)
            return res.status(HttpStatus.OK).json({success:true, topTrending:topTrending.slice(0,4),listCategory,categoryRating,topUser, topCollections})
        }catch(error){
            console.log(error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: this.value.Fail(), message: "Internal server error" })
        }
    }
    
}
