import { Body, Controller, Delete, Get, HttpStatus, Inject, Param, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Request, Response } from 'express';
import { CreateUserHealth } from '../userhealth/dto/userhealth.dto';
import { AuthenticationGuard } from '../../main.microservice/auth/auth.guard';
import { RolesGuard } from '../../main.microservice/auth/role.guard';
import { Roles } from '../../main.microservice/auth/role.decorator';
import { Role } from '../../main.microservice/user/dto/user.dto';
import { BodyCreateMealPlan, DefaultMealPlan, MealPlanCategory, RebuildBreakfast, RebuildMainMeal, UpdateMealPlanCategory } from './dto/meal.dto';

@Controller('api/mealplan')
export class MealplanController {
    constructor(@Inject('MEALPLAN_SERVICE') private readonly mealplanService: ClientProxy) { }

    @Get('getone/:_id')
    @UseGuards(AuthenticationGuard, RolesGuard)
    public getOne(@Req() req: Request, @Param('_id') _id: string, @Res() res: Response) {
        this.mealplanService.send({ cmd: 'get-one-meal-plan' }, { _id }).subscribe(
            (result) => {
                return res.status(result.httpStatus).json({ success: result.success, data: result.data, message: result.message });
            },
            (error) => {
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
            }
        );
    }
    @Get('getonebyuser')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.User)
    public getOneByUser(@Req() req: Request, @Res() res: Response) {
        this.mealplanService.send({ cmd: 'get-meal-plan-by-user' }, { _id: req['user'].accountId }).subscribe(
            (result) => {
                return res.status(result.httpStatus).json({ success: result.success, data: result.data, message: result.message });
            },
            (error) => {
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
            }
        );
    }
    @Get('getall')
    @UseGuards(AuthenticationGuard, RolesGuard)
    public getAll(@Req() req: Request, @Res() res: Response) {
        this.mealplanService.send({ cmd: 'get-all-meal-plan' }, {}).subscribe(
            (result) => {
                return res.status(result.httpStatus).json({ success: result.success, data: result.data, message: result.message });
            },
            (error) => {
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
            }
        );
    }
    @Get('getallcategorywithmealplan')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.Admin)
    public getAllCategoryWithMealplan(@Req() req: Request, @Res() res: Response) {
        this.mealplanService.send({ cmd: 'get-category-and-meal-plan' }, {}).subscribe(
            (result) => {
                return res.status(result.httpStatus).json({ success: result.success, data: result.data, message: result.message });
            },
            (error) => {
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
            }
        );
    }
    @Get('getalltostatistic')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.Admin)
    public getAllToStatistic(@Req() req: Request, @Res() res: Response) {
        this.mealplanService.send({ cmd: 'get-meal-plan-to-statistic' }, {}).subscribe(
            (result) => {
                return res.status(result.httpStatus).json({ success: result.success, data: result.data, message: result.message });
            },
            (error) => {
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
            }
        );
    }
    @Get('getallbycategory/:_id')
    @UseGuards(AuthenticationGuard, RolesGuard)
    public getAllByCategorty(@Req() req: Request, @Param('_id') _id: string, @Res() res: Response) {
        this.mealplanService.send({ cmd: 'get-meal-plan-by-category' }, { _id: _id }).subscribe(
            (result) => {
                return res.status(result.httpStatus).json({ success: result.success, data: result.data, message: result.message });
            },
            (error) => {
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
            }
        );
    }
    @Get('getallcategory')
    // @UseGuards(AuthenticationGuard, RolesGuard)
    public getAllCategorty(@Req() req: Request, @Res() res: Response) {
        this.mealplanService.send({ cmd: 'get-all-category' }, {}).subscribe(
            (result) => {
                return res.status(result.httpStatus).json({ success: result.success, data: result.data, message: result.message });
            },
            (error) => {
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
            }
        );
    }
    @Delete('delete/:_id')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.User)
    public deleteMealPlan(@Req() req: Request, @Param('_id') _id: string, @Res() res: Response) {
        this.mealplanService.send({ cmd: 'delete-meal-plan' }, { _id: _id, userId: req['user'].accountId }).subscribe(
            (result) => {
                return res.status(result.httpStatus).json({ success: result.success, data: result.data, message: result.message });
            },
            (error) => {
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
            }
        );
    }
    @Patch('updatepublic/:_id')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.User)
    public updateState(@Req() req: Request, @Param('_id') _id: string, @Res() res: Response) {
        this.mealplanService.send({ cmd: 'change-state-public' }, { _id: _id, userId: req['user'].accountId }).subscribe(
            (result) => {
                return res.status(result.httpStatus).json({ success: result.success, data: result.data, message: result.message });
            },
            (error) => {
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
            }
        );
    }
    @Post('createAutoMealPlan')
    @UseGuards(AuthenticationGuard, RolesGuard)
    // @Roles(Role.User)
    public createAutoMealPlan(@Req() req: Request, @Body() body: CreateUserHealth, @Res() res: Response) {
        body.User_id = req['user'].accountId
        console.log(body)
        this.mealplanService.send({ cmd: 'auto-create-mealplan' }, { body }).subscribe(
            (result) => {
                return res.status(result.httpStatus).json({ success: result.success, data: result.data, message: result.message });
            },
            (error) => {
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
            }
        );
    }
    @Post('createMealPlan')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.User)
    public createMealPlan(@Req() req: Request, @Body() body: BodyCreateMealPlan, @Res() res: Response) {
        body.mealplan.User_id = req['user'].accountId
        this.mealplanService.send({ cmd: 'create-mealplan' }, { mealplan: body.mealplan, days: body.days }).subscribe(
            (result) => {
                return res.status(result.httpStatus).json({ success: result.success, data: result.data, message: result.message });
            },
            (error) => {
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
            }
        );
    }
    @Post('saveAutoMealPlan')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.User)
    public saveAutoMealPlan(@Req() req: Request, @Body() body: DefaultMealPlan, @Res() res: Response) {
        body.User_id = req['user'].accountId
        this.mealplanService.send({ cmd: 'save-auto-mealplan' }, { body }).subscribe(
            (result) => {
                return res.status(result.httpStatus).json({ success: result.success, data: result.data, message: result.message });
            },
            (error) => {
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
            }
        );
    }
    @Patch('rebuildBreakfast')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.User)
    public rebuildBreakfast(@Req() req: Request, @Body() body: RebuildBreakfast, @Res() res: Response) {
        body.user_id = req['user'].accountId
        this.mealplanService.send({ cmd: 'rebuild-breakfast' }, { body }).subscribe(
            (result) => {
                return res.status(result.httpStatus).json({ success: result.success, data: result.data, message: result.message });
            },
            (error) => {
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
            }
        );
    }
    @Patch('rebuildMainMeal')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.User)
    public rebuildMainMeal(@Req() req: Request, @Body() body: RebuildMainMeal, @Res() res: Response) {
        body.user_id = req['user'].accountId
        this.mealplanService.send({ cmd: 'rebuild-mainmeal' }, { body }).subscribe(
            (result) => {
                return res.status(result.httpStatus).json({ success: result.success, data: result.data, message: result.message });
            },
            (error) => {
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
            }
        );
    }
    @Post('createCategory')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.Admin)
    public createCategory(@Req() req: Request, @Body() body: MealPlanCategory, @Res() res: Response) {
        this.mealplanService.send({ cmd: 'create-category' }, { body }).subscribe(
            (result) => {
                return res.status(result.httpStatus).json({ success: result.success, data: result.data, message: result.message });
            },
            (error) => {
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
            }
        );
    }
    @Patch('updateCategory')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.Admin)
    public updateCategory(@Req() req: Request, @Body() body: UpdateMealPlanCategory, @Res() res: Response) {
        this.mealplanService.send({ cmd: 'update-category' }, { body }).subscribe(
            (result) => {
                return res.status(result.httpStatus).json({ success: result.success, data: result.data, message: result.message });
            },
            (error) => {
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
            }
        );
    }
}
