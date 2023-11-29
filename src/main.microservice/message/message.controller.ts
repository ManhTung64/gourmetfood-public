import { Controller, Get, HttpStatus, Param, Patch, Req, Res, UseGuards } from '@nestjs/common';
import { MessageService } from './message.service';
import { Request, Response } from 'express';
import { IMessage } from './message.model';
import { AuthenticationGuard } from '../auth/auth.guard';
import { GetMessageByIndex } from './dto/message.dto';

@Controller('api/message')
export class MessageController {
    constructor(private readonly service:MessageService){

    }
    @Get("getall")
    @UseGuards(AuthenticationGuard)
    public async getListByUser(@Req() req:Request, @Res() res:Response){
        try{
            const data:IMessage[] = await this.service.getAllMessageByUser(req['user'].accountId)
            if (!data) return res.status(HttpStatus.BAD_REQUEST).json({success:false, message:"Error"})
            return res.status(HttpStatus.OK).json({success:true, data:data})
        }catch(error){
            console.log(error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({success:false,message:"Internal server error"})
        }
    }
    @Get("getmessage/:_id")
    @UseGuards(AuthenticationGuard)
    public async getMessage(@Req() req:Request,@Param("_id") _id:string, @Res() res:Response){
        try{
            const input:GetMessageByIndex = {index:1,sender_id:req['user'].accountId,receiver_id:_id}
            const data:IMessage[] = this.service.getMessage(input)
            if (!data) return res.status(HttpStatus.BAD_REQUEST).json({success:false, message:"Error"})
            return res.status(HttpStatus.OK).json({success:true, data:data})
        }catch(error){
            console.log(error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({success:false,message:"Internal server error"})
        }
    }
    @Get("seen/:_id")
    @UseGuards(AuthenticationGuard)
    public async seenMessage(@Param('_id') _id:string,@Req() req:Request, @Res() res:Response){
        try{
            const data:boolean = await this.service.seenMessage(_id)
            if (!data) return res.status(HttpStatus.BAD_REQUEST).json({success:false, message:"Error"})
            return res.status(HttpStatus.OK).json({success:true})
        }catch(error){
            console.log(error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({success:false,message:"Internal server error"})
        }
    }
}
