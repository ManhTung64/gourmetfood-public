import { IsNotEmpty, IsOptional, Length } from "class-validator"

export class ArticleState{
    @IsOptional()
    @Length(24)
    _id:string
    @IsNotEmpty()
    state:string
    @IsNotEmpty()
    @Length(24)
    Account_id:string
    @IsNotEmpty()
    @Length(24)
    Article_id:string
}
export class SocketStateData{
    success:boolean
    message:string
    data:any
}