import { Body, Controller, Get, HttpStatus, Inject, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Response, Request } from 'express';
import { Message } from '../../../otherModule/message.dto';
import { createActivityMode } from './activitymode.dto';
import { AuthenticationGuard } from '../../../main.microservice/auth/auth.guard';
import { RolesGuard } from '../../../main.microservice/auth/role.guard';
import { Roles } from '../../../main.microservice/auth/role.decorator';
import { Role } from '../../../main.microservice/user/dto/user.dto';

@Controller('api/activitymode')
export class ActivitymodeController {
    constructor(@Inject('ACTIVITYMODE_SERVICE') private readonly service: ClientProxy){
        
    }
    @Get('getall')
    public getActivityMode(@Res() res: Response) {
        this.service.send({ cmd: 'get-activity-mode' }, {}).subscribe(
            (result:Message) => {
                return res.status(result.httpStatus).json({success:result.success, message:result.message, data:result.data})
            },
            (error) => {
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({success:false,message:'Internal server error' })
            }
        )
    }
    @UseGuards(AuthenticationGuard,RolesGuard)
    @Roles(Role.Admin)
    @Post('addnew')
    public addNew(@Req() req:Request, @Body() body:createActivityMode, @Res() res: Response) {
        this.service.send({ cmd: 'add-new-activity-mode' }, {body}).subscribe(
            (result:Message) => {
                return res.status(result.httpStatus).json({success:result.success, message:result.message, data:result.data})
            },
            (error) => {
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({success:false,message:'Internal server error' })
            }
        )
    }
}
