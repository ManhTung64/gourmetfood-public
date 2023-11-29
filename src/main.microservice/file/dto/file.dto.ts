import { IsNotEmpty } from "class-validator";

export class UploadFile {
    buffer:Buffer
    originalname:string
    mimetype:string
}
export class File{
    Article_id?: string
    ArticleComment_id?: string
    RecipeComment_id?: string
    Recipe_id?:string
    files?: [file]
}
export class file{
    url:string
    isImage:boolean
    step?:number
}