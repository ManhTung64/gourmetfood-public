import { Schema } from "mongoose";

interface IRole extends Document{
    _id?:Schema.Types.ObjectId,
    role:string
}

const roleSchema:Schema<IRole> = new Schema<IRole>({
    role: {type:String, unique:true}
})
export {IRole, roleSchema}