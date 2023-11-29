import { Schema } from "mongoose";

interface IMessage extends Document{
    _id?:Schema.Types.ObjectId,
    sender_id:Schema.Types.ObjectId,
    time:Date,
    seen:boolean,
    content:string,
    receiver_id:Schema.Types.ObjectId,
    files?:string[]
}

const messageSchema:Schema<IMessage> = new Schema<IMessage>({
    sender_id: {type: Schema.Types.ObjectId, required:true, ref:'User'},
    seen:{type:Boolean, default:false},
    receiver_id: {type: Schema.Types.ObjectId, required:true, ref:'User'},
    content: {type:String},
    time: {type: Date, default:new Date()},
    files: {type:[String]}
})
export {IMessage, messageSchema}