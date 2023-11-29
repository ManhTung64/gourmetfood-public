import { IsNotEmpty, Length } from "class-validator"

export class ReportArticle{
    Article_id:string
}
export class CreateReport{
    Article_id?:string
    Account_id:string
    ArticleComment_id?:string
    Recipe_id?:string
    RecipeComment_id?:string
}
export class ConfirmReport{
    @IsNotEmpty()
    pass:boolean
    @IsNotEmpty()
    @Length(24)
    _id:string
    @IsNotEmpty()
    badwords:string[]

}