import { IsNotEmpty, IsOptional, Length } from "class-validator"
import { UploadFile } from "../../file/dto/file.dto"
import { IArticleComment } from "../articleComment/articleComment.model"
import { Schema } from "mongoose"

export class CreateArticleComment{
    @IsOptional()
    @Length(24)
    Account_id:string
    @IsNotEmpty()
    comment:string
    @IsNotEmpty()
    @Length(24)
    Article_id:string
    timeComment:Date
}
export class ArticleComment{
    @IsNotEmpty()
    @Length(24)
    _id:string
    @IsNotEmpty()
    @Length(24)
    Account_id:string
    @IsNotEmpty()
    comment:string
    @IsNotEmpty()
    @Length(24)
    Article_id:string
}
export class UpdateComment extends ArticleComment{
    @IsNotEmpty()
    @Length(24)
    _id:string
    @IsNotEmpty()
    @Length(24)
    Account_id:string
    @IsNotEmpty()
    comment:string
    @IsNotEmpty()
    @Length(24)
    Article_id:string
}
export class SocketCommentData{
    comment:unknown
    success:boolean
}
export interface ArticleCommentReturn extends Document{
    _id:Schema.Types.ObjectId
    Account_id:Schema.Types.ObjectId
    comment:string
    Article_id:Schema.Types.ObjectId
    timeComment:Date
    files:Array<unknown>
}
export class SocketCommentInputData{
    @IsNotEmpty()
    @Length(24)
    _id:string
}
export class DeleteCommentData extends SocketCommentInputData{
}
export class UpdateCommentData extends SocketCommentInputData{
}