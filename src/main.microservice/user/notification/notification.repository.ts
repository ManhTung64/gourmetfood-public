import { Repository } from "../../../../base/base.repository";
import { INotification } from "./notification.model";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class NotificationRepository extends Repository<INotification>{
    constructor(@InjectModel('Notification') private readonly notificationModel:Model<INotification>){
        super(notificationModel)
    }
    public getNotificationByUserId = (userId:string):INotification[]=>{
        try{
            return this.data.filter(notification=>{return notification.userId.toString() == userId})
        }catch(error){
            console.log(error)
            return null
        }
    }
}