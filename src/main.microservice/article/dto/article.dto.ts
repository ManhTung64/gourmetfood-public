import { IsNotEmpty, IsOptional, Length } from "class-validator"

export class Article{
    @Length(24)
    _id:string
    @IsNotEmpty()
    title:string
    timeUpload:Date
    @IsNotEmpty()
    content:string
    hashtag:string
    @IsNotEmpty()
    @Length(24)
    userId: string
    isShared:boolean
    @IsNotEmpty()
    @Length(24)
    Article_id: string
}

export class CreateArticle{
    @IsNotEmpty()
    title:string
    @IsNotEmpty()
    content:string
    timeUpload:Date
    hashtag:string
    @IsOptional()
    @Length(24)
    userId: string
    isShared:boolean
}
export class UpdateArticle{
    @IsNotEmpty()
    @Length(24)
    _id:string
    @IsOptional()
    title:string
    @IsOptional()
    content:string
    @IsOptional()
    hashtag:string
    @IsOptional()
    isShared:boolean
    @IsOptional()
    Article_id:string
    @IsOptional()
    oldFiles:[string]
    @IsOptional()
    newFileIndex:[number]
}
export class SharedArticle{
    article:Article
    @IsNotEmpty()
    @Length(24)
    ownerOfSharedArticle: string
}
export class DeleteArticle{
    @IsNotEmpty()
    @Length(24)
    _id:string
}
