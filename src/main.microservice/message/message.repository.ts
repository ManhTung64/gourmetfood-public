import { Repository } from "../../../base/base.repository";
import { IMessage } from "./message.model";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MessageRepository extends Repository<IMessage>{
    private MAX_MESSAGE:number = 10
    constructor(@InjectModel('Message') private readonly messageModel:Model<IMessage>){
        super(messageModel)
    }
    public findMessageByIndexAndSenderAndReciever = (index:number, from: string, to: string):IMessage[]=>{
        try{
            let messages:IMessage[] = []
            if (!this.data || this.data == null) return []
            let nMessage:number = 0
            for (let i = this.data.length - 1; i >= 0; i--){
                if ((this.data[i].sender_id.toString() == from && this.data[i].receiver_id.toString() == to) 
                || (this.data[i].sender_id.toString() == to && this.data[i].receiver_id.toString() == from) 
                && nMessage < index * this.MAX_MESSAGE){
                    messages.push(this.data[i])
                }
            }
            return messages
        }catch(error){
            console.log(error)
            return []
        }
    }
    public updateSeen = async (message:IMessage):Promise<boolean>=>{
        try{
            const data = await this.messageModel.updateMany({receiver_id:message.receiver_id,sender_id:message.sender_id},{
                seen:true
            })
            if (data){
                new Promise(()=>this.updateData())
                return true
            } 
            return false
        }catch(error){
            console.log(error)
            return false
        }
    }
    public getMessage = (receiver_id:string, sender_id:string, n:number):IMessage[]=>{
        try{
            const list:IMessage[] = this.data.filter((mess:IMessage, index)=>{
                return index < n && ((mess.receiver_id.toString() == receiver_id && mess.sender_id.toString() == sender_id) || 
                (mess.sender_id.toString() == receiver_id && mess.receiver_id.toString() == sender_id)) 
            })
            return list
        }catch(error){
            console.log(error)
            return null
        }
    }
    public findListReceiverBySender = async (_id:string):Promise<IMessage[]>=>{
        try{
            
            const list:any = await this.messageModel.aggregate([
                {
                    $match:{
                        $or:[
                            {sender_id:new Types.ObjectId(_id)},
                            {receiver_id:new Types.ObjectId(_id)}]
                        
                    }
                },{
                    $lookup:{
                        from:'users',
                        localField:'receiver_id',
                        foreignField:'_id',
                        as:'receiver'
                    }
                },{
                    $lookup:{
                        from:'users',
                        localField:'sender_id',
                        foreignField:'_id',
                        as:'sender'
                    }
                },{
                    $project:{
                        _id:1,
                        content:1,
                        time:1,
                        seen:1,
                        sender:{
                            $map:{
                                input:'$sender',
                                as:'sender',
                                in:{
                                    _id:'$$sender._id',
                                    name:'$$sender.name',
                                    avatar:'$$sender.avatar'
                                }
                            }
                        },receiver:{
                            $map:{
                                input:'$receiver',
                                as:'receiver',
                                in:{
                                    _id:'$$receiver._id',
                                    name:'$$receiver.name',
                                    avatar:'$$receiver.avatar'
                                }
                            }
                        }
                    }
                },{
                    $sort:{
                        time:-1
                    }
                }
            ])
            const listMessage:any[] = []
            list.map((message)=>{
                // let duplicate = null
                if (listMessage.length > 0) var duplicate:any = listMessage.find((mess)=>{
                    return (mess.receiver[0]._id.toString() == message.receiver[0]._id.toString() 
                    && mess.sender[0]._id.toString() ==  message.sender[0]._id.toString()) || 
                    (mess.sender[0]._id.toString() == message.receiver[0]._id.toString() 
                    && mess.receiver[0]._id.toString() ==  message.sender[0]._id.toString()) 
                })
                if (!duplicate) listMessage.push(message) 
            })
        return listMessage
        }catch(error){
            console.log(error)
            return []
        }
    }
}