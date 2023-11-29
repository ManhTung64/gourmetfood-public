import { IsNotEmpty, IsOptional, Length } from "class-validator";

export class CreateFollow{
    @IsNotEmpty()
    @Length(24)
    follower_id:string
    @IsOptional()
    @Length(24)
    following_id:string
}