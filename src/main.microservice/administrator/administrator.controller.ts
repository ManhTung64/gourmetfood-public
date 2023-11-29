import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';

import { AdministratorService } from './administrator.service';
import { BaseUser, Role } from '../user/dto/user.dto';
import { Response, Request } from 'express';
import { CountData, DeleteParam, changeActive } from './dto/admin.dto';
import { IRecipe } from '../recipe/recipe.model';
import { IArticle } from '../article/article.model';
import { ArticleService } from '../article/article.service';
import { RecipeService } from '../recipe/recipe.service';
import { AuthenticationGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { IUser } from '../user/user.model';

@Controller('api/admin')
export class AdministratorController  {
  constructor(private readonly adminService: AdministratorService, private readonly articleService: ArticleService,
    private readonly recipeService: RecipeService) {
  }
  @Get('getDashboard')
  @UseGuards(AuthenticationGuard, RolesGuard)
  @Roles(Role.Admin)
  public async getDashboard(@Req() req: Request, @Res() res: Response) {
    try {
      const data: CountData = this.adminService.getCountData();
      const [recipes, ratingsAvg] = await Promise.all([
        this.adminService.getTopTrendingRecipe(),
        this.adminService.getRatingOfCategory()
      ]);
      return res.status(HttpStatus.OK).json({ success: true, data: data, rating: ratingsAvg, recipes: recipes })
    } catch (error) {
      console.log(error)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error" })
    }
  }
  @Get('getUserDashboard')
  @UseGuards(AuthenticationGuard, RolesGuard)
  @Roles(Role.Admin)
  public async getUserDashboard(@Req() req: Request, @Res() res: Response) {
    try {
      const [users, sponsors] = await Promise.all([
        this.adminService.getUserByMonth(),
        this.adminService.getSponsorByMonth(),
      ]);
      return res.status(HttpStatus.OK).json({ success: true, users: users, sponsors: sponsors })
    } catch (error) {
      console.log(error)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error" })
    }
  }
  @Get('getAllAccount')
  @UseGuards(AuthenticationGuard, RolesGuard)
  @Roles(Role.Admin)
  public async getAllAccount(@Req() req: Request, @Res() res: Response) {
    try {
      const listUsers: Array<BaseUser> | null = await this.adminService.getUserList()
      if (!listUsers) return res.status(HttpStatus.OK).json({ success: true, message: "Not found" })
      else return res.status(HttpStatus.OK).json({ success: true, listUsers })
    } catch (error) {
      console.log(error)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error" })
    }
  }
  @Get('getAllCategory')
  @UseGuards(AuthenticationGuard, RolesGuard)
  @Roles(Role.Admin)
  public async getAllCategory(@Req() req: Request, @Res() res: Response) {
    try {
      const categories: any = await this.adminService.getRecipesEachCategory()
      if (!categories) return res.status(HttpStatus.OK).json({ success: true, message: "Not found" })
      else return res.status(HttpStatus.OK).json({ success: true, categories })
    } catch (error) {
      console.log(error)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error" })
    }
  }
  @Get('getTopTrending')
  @UseGuards(AuthenticationGuard, RolesGuard)
  @Roles(Role.Admin)
  public async getTopTrending(@Req() req: Request, @Res() res: Response) {
    try {
      const recipes: IRecipe[] = await this.adminService.getTopTrendingRecipe()
      if (!recipes) return res.status(HttpStatus.OK).json({ success: true, message: "Not found" })
      else return res.status(HttpStatus.OK).json({ success: true, recipes })
    } catch (error) {
      console.log(error)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error" })
    }
  }
  @Get('getUsersInformation')
  @UseGuards(AuthenticationGuard, RolesGuard)
  @Roles(Role.Admin)
  public async getUsersInformation(@Req() req: Request, @Res() res: Response) {
    try {
      const listUsers: unknown = await this.adminService.getUserInformation()
      if (!listUsers) return res.status(HttpStatus.OK).json({ success: true, message: "Not found" })
      else return res.status(HttpStatus.OK).json({ success: true, listUsers })
    } catch (error) {
      console.log(error)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error" })
    }
  }
  @Get('getSponsorList')
  @UseGuards(AuthenticationGuard, RolesGuard)
  @Roles(Role.Admin)
  public async getSponsorList(@Req() req: Request, @Res() res: Response) {
    try {
      const list: IUser[] = await this.adminService.getListSponsor()
      if (!list) return res.status(HttpStatus.OK).json({ success: true, message: "Not found" })
      else return res.status(HttpStatus.OK).json({ success: true, list })
    } catch (error) {
      console.log(error)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error" })
    }
  }
  @Patch('changeActiveState')
  @UseGuards(AuthenticationGuard, RolesGuard)
  @Roles(Role.Admin)
  public async changeActiveState(@Req() req: Request, @Body() body: changeActive, @Res() res: Response) {
    try {
      if (await this.adminService.UpdateStateActiveForUser(body.active, body._id)) return res.status(HttpStatus.OK).json({ success: true })
      else return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Account invalid" })
    } catch (error) {
      console.log(error)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error" })
    }
  }
  @Get('getArticlesInformation')
  @UseGuards(AuthenticationGuard, RolesGuard)
  @Roles(Role.Admin)
  public async getArticlesInformation(@Req() req: Request, @Res() res: Response) {
    try {
      const articles: IArticle[] = await this.adminService.getArticlesInformation()
      if (!articles) return res.status(HttpStatus.OK).json({ success: true, message: "Not found" })
      else return res.status(HttpStatus.OK).json({ success: true, articles })
    } catch (error) {
      console.log(error)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error" })
    }
  }
  @Get('getRecipesInformation')
  @UseGuards(AuthenticationGuard, RolesGuard)
  @Roles(Role.Admin)
  public async getRecipesInformation(@Req() req: Request, @Res() res: Response) {
    try {
      const recipes: IRecipe[] = await this.adminService.getRecipesInformation()
      if (!recipes) return res.status(HttpStatus.OK).json({ success: true, message: "Not found" })
      else return res.status(HttpStatus.OK).json({ success: true, recipes })
    } catch (error) {
      console.log(error)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error" })
    }
  }
  @Delete('deleteArticle/:_id')
  @UseGuards(AuthenticationGuard, RolesGuard)
  @Roles(Role.Admin)
  public async deleteArticle(@Req() req: Request, @Param() _id: DeleteParam, @Res() res: Response) {
    try {
      const success: boolean = await this.articleService.deleteArticle(_id._id)
      if (!success) return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Delete failed" })
      else return res.status(HttpStatus.OK).json({ success: true })
    } catch (error) {
      console.log(error)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error" })
    }
  }
  @Delete('deleteRecipe/:_id')
  @UseGuards(AuthenticationGuard, RolesGuard)
  @Roles(Role.Admin)
  public async deleteRecipe(@Req() req: Request, @Param() _id: DeleteParam, @Res() res: Response) {
    try {
      const success: boolean = await this.recipeService.deleteRecipeWithId(_id._id, true)
      if (!success) return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Delete failed" })
      else return res.status(HttpStatus.OK).json({ success: true })
    } catch (error) {
      console.log(error)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error" })
    }
  }
}
