import { Body, Controller, Get, HttpStatus, Param, Patch, Req, Res, UseGuards } from '@nestjs/common';
import {  ConfirmReport, ReportArticle } from './dto/articleReport.dto';
import { Response, Request } from 'express';
import { AuthenticationGuard } from '../auth/auth.guard';
import { IReport } from './report.model';
import { ReportService } from './report.service';
import { ConstValue } from '../../otherModule/shared/defaultValues';
import { RolesGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { Role } from '../user/dto/user.dto';

@Controller('api/report')
export class ReportController {
    private IS_ARTICLE:boolean = true
    private IS_COMMENT:boolean = true
    constructor(private readonly service:ReportService, private readonly value:ConstValue
        ){

    }
    @Get('article/:_id')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.Sponsor,Role.User)
    public async reportArticle (@Param('_id') _id:string,@Req() req:Request, @Res() res:Response){
        try{
            const result: IReport | null = await this.service.addNewReport(_id,req['user'].accountId,this.IS_ARTICLE, !this.IS_COMMENT)
            if (!result) return res.status(HttpStatus.BAD_REQUEST).json({success:this.value.Fail(),message:"Report failed"})
            else return res.status(HttpStatus.OK).json({success:this.value.Success(),data:result})
        }catch(error){
            console.log(error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({success:false,message:"Internal server error"})
        }
    }
    @Get('getArticleReport')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.Admin)
    public async getArticleReport (@Req() req:Request, @Res() res:Response){
        try{
            const result: IReport[] = await this.service.getArticleReports()
            if (!result) return res.status(HttpStatus.BAD_REQUEST).json({success:this.value.Fail(),message:"Report failed"})
            else return res.status(HttpStatus.OK).json({success:this.value.Success(),data:result})
        }catch(error){
            console.log(error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({success:false,message:"Internal server error"})
        }
    }
    @Get('getRecipeReport')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.Admin)
    public async getRecipeReport (@Req() req:Request, @Res() res:Response){
        try{
            const result: IReport[] = await this.service.getRecipeReports()
            if (!result) return res.status(HttpStatus.BAD_REQUEST).json({success:this.value.Fail(),message:"Report failed"})
            else return res.status(HttpStatus.OK).json({success:this.value.Success(),data:result})
        }catch(error){
            console.log(error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({success:false,message:"Internal server error"})
        }
    }
    @Patch('censored')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.Admin)
    public async censored (@Body() body:ConfirmReport,@Req() req:Request, @Res() res:Response){
        try{
            const success:boolean = await this.service.confirmReport(body._id,body.pass,body.badwords)
            if (!success) return res.status(HttpStatus.BAD_REQUEST).json({success:this.value.Fail(),message:"Censore Failed"})
            else return res.status(HttpStatus.OK).json({success:this.value.Success(),message:"Censore Successful"})
        }catch(error){
            console.log(error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({success:false,message:"Internal server error"})
        }
    }
}
