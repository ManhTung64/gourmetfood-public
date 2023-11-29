import { IsNotEmpty, Length } from "class-validator"

export class CreateRecipeComment{
    @IsNotEmpty()
    @Length(24)
    Account_id:string
    @IsNotEmpty()
    comment:string
    @IsNotEmpty()
    @Length(24)
    Recipe_id:string
    timeComment:Date
}
export class RecipeComment{
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
    Recipe_id:string
}