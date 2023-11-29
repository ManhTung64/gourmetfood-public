import { Schema } from "mongoose";

interface INotification extends Document{
    _id?:Schema.Types.ObjectId,
    userId:Schema.Types.ObjectId,
    message:string,
    date:Date
}

const notificationSchema:Schema<INotification> = new Schema<INotification>({
    userId:{type:Schema.Types.ObjectId, required:true, ref:'User'},
    message:{type:String, required:true},
    date:{type:Date, default:new Date()}
})

export {INotification, notificationSchema}