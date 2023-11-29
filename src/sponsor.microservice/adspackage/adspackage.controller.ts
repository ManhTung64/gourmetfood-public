import { Body, Controller, Get, HttpStatus, Inject, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Message } from 'src/otherModule/message.dto';
import { AdsPackage, UpdateAdsPackage } from './adspackage.dto';
import { AuthenticationGuard } from '../../main.microservice/auth/auth.guard';
import { RolesGuard } from '../../main.microservice/auth/role.guard';
import { Roles } from '../../main.microservice/auth/role.decorator';
import { Role } from '../../main.microservice/user/dto/user.dto';
import {Request,Response} from 'express'
@Controller('api/adspackage')
export class AdspackageController {
    constructor(@Inject('ADSPACKAGE_SERVICE') private readonly adsPackageService: ClientProxy) { }

    @Get('getall')
    public getListAdsPackage(@Res() res: Response) {
        try {
            this.adsPackageService.send({ cmd: 'get-list-ads-package' }, {}).subscribe(
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
    // @Post('addnew')
    // @UseGuards(AuthenticationGuard, RolesGuard)
    // @Roles(Role.Admin)
    // public addAdsPackage(@Req() req:Request,@Body() body: AdsPackage, @Res() res: Response) {
    //     try{
    //         this.adsPackageService.send({ cmd: 'add-ads-package' }, {  }).subscribe(
    //             (result: Message) => {
    //                 return res.status(result.httpStatus).json({ success: result.success, data: result.data, message: result.message });
    //             },
    //             (error) => {
    //                 return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
    //             }
    //         );
    //     }catch (error) {
    //         return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
    //     }
        
    // }
    @Patch('update')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.Admin)
    public updateAdsPackage(@Req() req:Request,@Body() body: UpdateAdsPackage, @Res() res: Response) {
        try{
            this.adsPackageService.send({ cmd: 'update-ads-package' }, { body }).subscribe(
                (result: Message) => {
                    return res.status(result.httpStatus).json({ success: result.success, data: result.data, message: result.message });
                },
                (error) => {
                    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
                }
            );
        }catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
        }
        
    }
}
