import { Body, Controller, Get, HttpStatus, Inject, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { ClientProxy } from '@nestjs/microservices';
import { AuthenticationGuard } from '../../main.microservice/auth/auth.guard';
import { Roles } from '../../main.microservice/auth/role.decorator';
import { RolesGuard } from '../../main.microservice/auth/role.guard';
import { Role } from '../../main.microservice/user/dto/user.dto';
import { CreateDisease } from './disease.dto';

@Controller('api/disease')
export class DiseaseController {
    constructor(@Inject('DISEASE_SERVICE') private readonly diseaseService: ClientProxy){
        
    }
    @Post('addnew')
    @UseGuards(AuthenticationGuard,RolesGuard)
    @Roles(Role.Admin)
    public getMealPlan(@Req() req:Request, @Body() body:CreateDisease, @Res() res: Response) {
        this.diseaseService.send({ cmd: 'add-new-disease' }, { body }).subscribe(
            (result) => {
                return res.status(result.httpStatus).json({success:true, data: result });
            },
            (error) => {
                console.log(error)
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({success:false,message:'Internal server error' });
            }
        );
    }
    @Get('getall')
    public getAll(@Req() req:Request, @Res() res: Response) {
        this.diseaseService.send({ cmd: 'get-disease' }, {  }).subscribe(
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
