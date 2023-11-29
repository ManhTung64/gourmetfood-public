import {Schema} from "mongoose"

interface IUser extends Document{
  _id?:Schema.Types.ObjectId
  name:string,
  email?:string,
  avatar:string,
  username:string,
  password:string,
  dob?:Date,
  gender?:string,
  address?:string,
  country?:string,
  active:boolean,
  verify?:boolean,
  role:Schema.Types.ObjectId,
  createAt:Date
}

const userSchema:Schema<IUser> = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String },
  avatar: { type: String, required: true},
  username: { type: String,unique:true, required: true,minlength:8},
  password: { type: String, minlength: 8},
  dob: { type: Date},
  gender: { type: String, enum:['male','female']},
  address: { type: String},
  verify:{type:Boolean, default:false},
  country: { type: String},
  active: { type: Boolean, default:true},
  role:{type:Schema.Types.ObjectId, required:true, ref:'Role'},
  createAt:{type:Date,default:new Date()}
})
export {userSchema, IUser}