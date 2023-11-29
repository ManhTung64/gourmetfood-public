import { Body, Controller, Get, HttpStatus, Inject, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Response, Request } from 'express';
import { AuthenticationGuard } from '../../main.microservice/auth/auth.guard';
import { Message } from 'src/otherModule/message.dto';
import { BodyUserPackage } from './userpackage.dto';
import { RolesGuard } from '../../main.microservice/auth/role.guard';
import { Roles } from '../../main.microservice/auth/role.decorator';
import { Role } from '../../main.microservice/user/dto/user.dto';
import { config } from 'dotenv';
config()

@Controller('api/userpackage')
export class UserpackageController {
    constructor(@Inject('USERPACKAGE_SERVICE') private readonly userPackageService: ClientProxy) {}

    @Get('getall')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.Admin)
    public async getListUserPackage(@Req() req:Request,@Res() res: Response) {
        try{
            this.userPackageService.send({ cmd: 'get-list-user-package' }, { }).subscribe(
                (result:Message) => {
                    return res.status(result.httpStatus).json({success:result.success, data:result.data, message:result.message});
                },
                (error) => {
                    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({success:false,message:'Internal server error' });
                }
            );
        }catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
        }
        
    }
    @Get('getHistoryUserPackage')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.Sponsor)
    public async getHistoryAdspackageBySponsor(@Req() req:Request, @Res() res: Response) {
        try {
            this.userPackageService.send({ cmd: 'get-history-user-package' }, { _id:req['user'].accountId }).subscribe(
                (result: Message) => {
                    return res.status(result.httpStatus).json({ success: result.success, data: result.data, message: result.message });
                },
                (error) => {
                    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
                }
            );
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
        }
    }
    @Get('getrevenue')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.Admin)
    public async getRevenue(@Req() req:Request,@Res() res: Response) {
        try{
            this.userPackageService.send({ cmd: 'get-revenue' }, { }).subscribe(
                (result:Message) => {
                    return res.status(result.httpStatus).json({success:result.success, data:result.data, message:result.message});
                },
                (error) => {
                    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({success:false,message:'Internal server error' });
                }
            );
        }catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
        }
        
    }
    @Get('getcount')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.Admin)
    public getCountAllPackage(@Res() res: Response) {
        try {
            this.userPackageService.send({ cmd: 'get-count-package' }, {}).subscribe(
                (result: Message) => {
                    return res.status(result.httpStatus).json({ success: result.success, data: result.data, message: result.message });
                },
                (error) => {
                    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
                }
            );
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
        }

    }
    @Post('addnew')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.Sponsor)
    public addAdsPackage(@Req() req:Request, @Body() body:BodyUserPackage,@Res() res: Response) {
        try{
            body.userPackage.Account_id = req['user'].accountId
            this.userPackageService.send({ cmd: 'add-user-package' }, { body }).subscribe(
                (result:Message) => {
                    return res.status(result.httpStatus).json({success:result.success, data:result.data, message:result.message});
                },
                (error) => {
                    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({success:false,message:'Internal server error' });
                }
            );
        }catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
        }  
    }
    @Get('getPaypalClientId')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.Sponsor)
    public getPaypalCLientId(@Req() req:Request, @Res() res: Response) {
        try{
            return res.status(HttpStatus.OK).json({ success: true, data:process.env.PAYPAL_CLIENT_ID});
        }catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
        }  
    }
    @Get('getAds')
    @UseGuards(AuthenticationGuard)
    public getAds(@Req() req:Request, @Res() res: Response) {
        try{
            this.userPackageService.send({ cmd: 'display-ads' }, { }).subscribe(
                (result:Message) => {
                    return res.status(result.httpStatus).json({success:result.success, data:result.data, message:result.message});
                },
                (error) => {
                    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({success:false,message:'Internal server error' });
                }
            );
        }catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
        }  
    }
}
