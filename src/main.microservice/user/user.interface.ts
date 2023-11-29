export interface IBaseUser extends Document{
    name:string,
    email?:string,
    avatar?:string,
    username:string,
}
export interface NormalUser extends IBaseUser {
    password:string,
    dob?:Date,
    gender?:string,
    address?:string,
    country?:string,
    active?:boolean
}
export interface NormalUserHasId extends NormalUser {
    _id:string,
}
export interface BaseUserHasId extends IBaseUser {
    _id:string,
}
export interface UserVerifyCode{
    _id:string,
    allow:boolean
}
export interface User extends NormalUser{
    active:boolean
}
export interface UpdateUser{
    dob?:Date,
    gender?:string,
    address?:string,
    country?:string,
    _id:string,
    name?:string,
    avatar?:string,
    active:boolean
}