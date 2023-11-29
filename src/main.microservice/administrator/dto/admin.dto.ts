import { IsNotEmpty, Length } from "class-validator"

export class changeActive{
    @IsNotEmpty()
    @Length(24)
    _id:string
    @IsNotEmpty()
    active:boolean
}
export class CountData{
    ratingDevUser:object
    ratingDevRecipe:object
    ratingDevArticle:object
}
export class DeleteParam{
    @IsNotEmpty()
    @Length(24)
    _id:string
}