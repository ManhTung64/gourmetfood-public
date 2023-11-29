import { IsNotEmpty, IsOptional, Length } from "class-validator"

export class BodyUserPackage{
    data:any
    userPackage:UserPackage
}
export class UserPackage{
    @IsOptional()
    @Length(24)
    Account_id:string
    @IsNotEmpty()
    @Length(24)
    AdsPackage_id:string
}
