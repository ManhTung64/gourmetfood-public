import { IsNotEmpty, IsOptional, Length } from "class-validator"

export class Ads{
    @IsNotEmpty()
    @Length(24)
    Article_id:string
    @IsNotEmpty()
    @Length(24)
    Account_id:string
}
export class UpdateImage{
    @IsNotEmpty()
    @Length(24)
    _id:string
    @IsOptional()
    image:string
}
export class UpdateActive{
    @IsNotEmpty()
    @Length(24)
    _id:string
}
export class UpdateBanner{
    @IsNotEmpty()
    @Length(24)
    _id:string
}