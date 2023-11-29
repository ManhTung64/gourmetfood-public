import { Injectable } from '@nestjs/common';
import { MessageRepository } from './message.repository';
import { CreateMessage, DeleteMessage, GetMessageByIndex } from './dto/message.dto';
import { UploadFile } from '../file/dto/file.dto';
import { IMessage } from './message.model';
import S3 from '../../otherModule/shared/s3.service';
import { UserRepository } from '../user/user.repository';
import { get } from 'http';

@Injectable()
export class MessageService {
    constructor(private readonly repository:MessageRepository, private readonly s3:S3, private readonly userRepository:UserRepository){

    }
    public addMessage = async (message:CreateMessage):Promise<IMessage | null>=>{
        try{
            if (!message.receiver_id || !message.sender_id)throw new Error("Missing information")
            else if (!this.userRepository.findById(message.sender_id))  throw new Error("Invalid information")
            message.time = new Date()
        
            // let urls:string[] = []
            // if (message.filesUpload) urls = await this.s3.UploadManyFiles(message.filesUpload)
            // if (urls.length > 0)message.files = urls
            return await this.repository.addNew(message)
        }catch(error){
            console.log(error)
            return null
        }
    }
    // public getMessage = (other_id:string, user_id:string, index:number):IMessage[]=>{
    //     try{
    //         if (!this.userRepository.findById(other_id)) return null
    //         return this.repository.getMessage(other_id,user_id,index)
    //     }catch(error){
    //         console.log(error)
    //         return null
    //     }
    // }
    public seenMessage = async(message_id:string):Promise<boolean>=>{
        try{
            const message:IMessage = this.repository.findById(message_id)
            if (!message) return false
            else return await this.repository.updateSeen(message)
        }catch(error){
            console.log(error)
            return false
        }
    }
    public getAllMessageByUser = async (_id:string):Promise<IMessage[]>=>{
        try{
            const list:IMessage[] = await this.repository.findListReceiverBySender(_id)
            return list
        }catch(error){
            console.log(error)
            return null
        }
    }
    public deleteMessage = async (message:DeleteMessage):Promise<boolean>=>{
        try{
            if (!message.sender_id || !message._id) throw new Error("Missing information")
            else if (this.repository.findById(message._id).sender_id.toString() != message.sender_id) throw new Error("Cannot delete")
            return await this.repository.delete(message._id)
        }catch(error){
            console.log(error)
            return false
        }
    }
    public getMessage = (getMessage:GetMessageByIndex):IMessage[]=>{
        try{
            if (getMessage.index == null || !getMessage.receiver_id || !getMessage.sender_id) throw new Error("Missing information")
            return this.repository.findMessageByIndexAndSenderAndReciever(getMessage.index,getMessage.sender_id, getMessage.receiver_id)
        }catch(error){
            console.log(error)
            return []
        }
    }
}
