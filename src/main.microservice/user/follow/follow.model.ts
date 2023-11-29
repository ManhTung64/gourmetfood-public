import { Schema } from "mongoose";

interface IFollow extends Document{
    _id?:Schema.Types.ObjectId,
    following_id:Schema.Types.ObjectId,
    follower_id:Schema.Types.ObjectId
}
const followSchema:Schema<IFollow> = new Schema<IFollow>({
    following_id:{type:Schema.Types.ObjectId, required:true,ref:'User'},
    follower_id:{type:Schema.Types.ObjectId, required:true,ref:'User'}
})
export {IFollow,followSchema}