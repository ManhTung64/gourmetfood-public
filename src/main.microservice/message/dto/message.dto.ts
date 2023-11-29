import { IsNotEmpty, IsOptional, Length } from "class-validator"
import { UploadFile } from "../../file/dto/file.dto"

export class CreateMessage{
    @Length(24)
    sender_id:string
    @IsOptional()
    time:Date
    @IsNotEmpty()
    content:string
    @IsNotEmpty()
    @Length(24)
    receiver_id:string
    // files?:string[]
    // filesUpload?:Array<UploadFile>
}
export class DeleteMessage{
    @Length(24)
    sender_id:string
    @IsNotEmpty()
    @Length(24)
    _id:string
}
export class GetMessageByIndex{
    @IsNotEmpty()
    index:number
    @Length(24)
    sender_id:string
    @IsNotEmpty()
    @Length(24)
    receiver_id:string
}