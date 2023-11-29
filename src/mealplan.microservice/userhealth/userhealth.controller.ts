import { Body, Controller, Get, HttpStatus, Inject, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserHealth, CreateUserHealthAfterRegister } from './dto/userhealth.dto';
import { Request, Response } from 'express';
import { AuthenticationGuard } from '../../main.microservice/auth/auth.guard';
import { RolesGuard } from '../../main.microservice/auth/role.guard';
import { Roles } from '../../main.microservice/auth/role.decorator';
import { Role } from '../../main.microservice/user/dto/user.dto';

@Controller('api/userhealth')
export class UserhealthController {
    constructor(@Inject('USERHEALTH_SERVICE') private readonly userHealthService: ClientProxy) {}

    @Post('addnew')
    @UseGuards(AuthenticationGuard,RolesGuard)
    @Roles(Role.User)
    public getMealPlan(@Req() req:Request, @Body() body:CreateUserHealth, @Res() res: Response) {
        body.User_id = req['user'].accountId
        this.userHealthService.send({ cmd: 'add-new-userhealth' }, { body }).subscribe(
            (result) => {
                return res.status(result.httpStatus).json({success:true, data: result });
            },
            (error) => {
                console.log(error)
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({success:false,message:'Internal server error' });
            }
        );
    }
    @Post('addnewafterregister')
    @UseGuards(AuthenticationGuard,RolesGuard)
    @Roles(Role.User)
    public addNewUserHealth(@Req() req:Request, @Body() body:CreateUserHealthAfterRegister, @Res() res: Response) {
        body.User_id = req['user'].accountId
        this.userHealthService.send({ cmd: 'add-user-health-after-register' }, { body }).subscribe(
            (result) => {
                return res.status(result.httpStatus).json({success:true, data: result });
            },
            (error) => {
                console.log(error)
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({success:false,message:'Internal server error' });
            }
        );
    }
    @Get('get')
    @UseGuards(AuthenticationGuard,RolesGuard)
    @Roles(Role.User)
    public getByUser(@Req() req:Request, @Res() res: Response) {
        this.userHealthService.send({ cmd: 'get-user-health' }, { _id:req['user'].accountId }).subscribe(
            (result) => {
                return res.status(result.httpStatus).json({success:true, data: result });
            },
            (error) => {
                console.log(error)
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({success:false,message:'Internal server error' });
            }
        );
    }
}
