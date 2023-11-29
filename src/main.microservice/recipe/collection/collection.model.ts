import { Schema } from "mongoose";


interface ICollection extends Document{
    _id?:Schema.Types.ObjectId,
    name:string,
    Account_id:Schema.Types.ObjectId
}

const collectionSchema:Schema<ICollection> = new Schema<ICollection>({
    name: {type:String, required:true},
    Account_id:{type:Schema.Types.ObjectId, required:true, ref:'User'}
})
export {collectionSchema, ICollection}