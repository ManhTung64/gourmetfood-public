import {IsEmail, IsNotEmpty, IsOptional, IsStrongPassword, Length} from "class-validator";
export class Updateuser{
    dob:Date
    gender:string
    address:string
    country:string
    @IsNotEmpty({ message: '_id is required' })
    @Length(24,24,{ message: 'id is invalid' })
    _id:string 
    name:string
    avatar:string
    active:boolean
}
export enum Role{
    Admin = '653b77c46139d7a2604cedb5',
    Sponsor = '653b77c46139d7a2604cedb7',
    User = '653b77c56139d7a2604cedb9'
}
export class CreateUser{
    @IsOptional()
    name:string
    @IsNotEmpty()
    @IsEmail()
    email:string
    @IsOptional()
    avatar:string
    @IsNotEmpty()
    @Length(8)
    username:string
    @IsStrongPassword()
    password:string
    @IsOptional()
    dob:Date
    @IsOptional()
    gender:string
    @IsOptional()
    address:string
    @IsOptional()
    country:string
    @IsOptional()
    active:boolean
    @IsNotEmpty()
    rePassword:string
    role:string
    @IsOptional()
    createAt:Date
}
export class createCode {
    @IsNotEmpty()
    @IsEmail()
    email:string
}
export class verifyCode {
    @IsNotEmpty()
    @IsEmail()
    email:string
    @IsNotEmpty()
    @Length(6)
    code:string
    @IsOptional()
    cfMail:boolean
}
export class changePasswordWithoutOldPassword{
    @IsNotEmpty({ message: '_id is required' })
    @Length(24,24,{ message: 'id is invalid' })
    _id:string
    @IsNotEmpty()
    @IsStrongPassword()
    password:string
    @IsNotEmpty()
    rePassword:string
}
export class changePasswordWithOldPassword{
    @IsNotEmpty()
    username:string
    @IsNotEmpty()
    oldPassword:string
    @IsNotEmpty()
    @IsStrongPassword()
    password:string
    @IsNotEmpty()
    rePassword:string
}
export class changeEmailFirstStep{
    @IsNotEmpty({ message: '_id is required' })
    @Length(24,24,{ message: 'id is invalid' })
    _id:string
    @IsNotEmpty()
    @IsEmail()
    oldEmail:string
    @IsNotEmpty()
    @IsEmail()
    email:string
}
export class changeEmailSecondStep{
    @IsNotEmpty({ message: '_id is required' })
    @Length(24,24,{ message: 'id is invalid' })
    _id:string
    @IsNotEmpty()
    @IsEmail()
    oldEmail:string
    @IsNotEmpty()
    @IsEmail()
    email:string
    @IsNotEmpty()
    @Length(6)
    code:string
}
export class BaseUser{
    @IsNotEmpty()
    username:string
    @IsNotEmpty()
    avatar:string
    @IsNotEmpty()
    name:string
    @IsNotEmpty()
    @IsEmail()
    email:string
    role:string
    @IsOptional()
    createAt:Date
    @IsOptional()
    verify:boolean
}