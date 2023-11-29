import { Body, Controller, HttpStatus, Inject, Patch, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Message } from 'src/otherModule/message.dto';
import {Request,Response} from 'express'
import { Ads, UpdateActive, UpdateBanner, UpdateImage } from './ads.dto';
import { AuthenticationGuard } from '../../main.microservice/auth/auth.guard';
import { RolesGuard } from '../../main.microservice/auth/role.guard';
import { Roles } from '../../main.microservice/auth/role.decorator';
import { Role } from '../../main.microservice/user/dto/user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import S3 from '../../otherModule/shared/s3.service';

@Controller('api/ads')
export class AdsController {
    constructor(@Inject('ADS_SERVICE') private readonly adsService: ClientProxy, private readonly s3Service: S3) { }

    @Patch('update')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.Sponsor)
    @UseInterceptors(FileInterceptor('file'))
    public async updateAds(@Req() req:Request, @Body() body: UpdateImage, @UploadedFile() file: Express.Multer.File, @Res() res: Response) {
        try {
            // upload file and get url
            if (!file) return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: 'Missing file' });
            body.image = await this.s3Service.UploadOneFile(file)
            this.adsService.send({ cmd: 'update-ads' }, { body }).subscribe(
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
    @Patch('active')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.Sponsor)
    public async activeAds(@Req() req:Request, @Body() body: UpdateActive, @Res() res: Response) {
        try {
            // upload file and get url
            this.adsService.send({ cmd: 'update-active' }, { body }).subscribe(
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
    @Patch('activeBanner')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.Sponsor)
    public async activeBannerAds(@Req() req:Request, @Body() body: UpdateBanner, @Res() res: Response) {
        try {
            // upload file and get url
            this.adsService.send({ cmd: 'change-banner' }, { body }).subscribe(
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
