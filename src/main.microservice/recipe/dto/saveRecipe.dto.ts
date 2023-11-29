import { IsNotEmpty, IsOptional, Length } from "class-validator";

export class CreateSaveRecipe{
    @IsNotEmpty()
    @Length(24)
    Collection_id:string
    @IsNotEmpty()
    @Length(24)
    _id:string
    @IsOptional()
    saveDate:Date
    @IsNotEmpty()
    isRecipe:boolean
    @IsOptional()
    Recipe_id:string
    @IsOptional()
    MealPlan_id:string
}
export class RemoveSaveRecipe{
    @IsNotEmpty()
    @Length(24)
    _id:string
    @IsNotEmpty()
    @Length(24)
    Collection_id:string
}