import { IsNotEmpty, IsOptional, Length, Min } from "class-validator"
import { UploadFile } from "../../file/dto/file.dto"

export class Ingredients{
    @IsNotEmpty()
    name:string
    calo:number
    @IsNotEmpty()
    quantitative:number
    @IsNotEmpty()
    quantitativeUnit:string
    protein: number
    carbs: number
    fat: number
    sugar: number
    fiber: number
    sodium: number
}
export class NutrionCalculate{
    ingredients:Ingredients[]
    nutrion:Nutrion
}
export class Nutrion{
    calo:number
    protein: number
    carbs: number
    fat: number
    sugar: number
    fiber: number
    sodium: number
}
export class StepBeforeUpload{
    @IsNotEmpty()
    no:number
    @IsNotEmpty()
    detail:string
    files?: Array<UploadFile>
    @IsNotEmpty()
    resources:number
}
export class StepAfterUpload{
    no:number
    detail:string
}
export class File{
    type:string
    url:string
}
export class Recipe{
    @IsOptional()
    type:string
    @IsNotEmpty()
    name: string
    @IsNotEmpty()
    Category: string
    @IsOptional()
    nutrion:Nutrion
    @IsNotEmpty()
    description: string
    @IsOptional()
    ingredientsString:string
    @IsOptional()
    // @IsNotEmpty()
    ingredients: Ingredients[] 
    @IsOptional()
    timeCook:number
    @IsOptional()
    timePrepare:number
    // @IsNotEmpty()
    @IsOptional()
    stepsString:string
    @IsOptional()
    steps:StepBeforeUpload[]
    // @Min(1)
    @IsNotEmpty()
    nPerson:number
    @IsOptional()
    timeUpload:Date
    @IsOptional()
    image:string
    @IsOptional()
    prepare?:string
    @IsOptional()
    @Length(24)
    User_id:string
}
export class UpdateRecipe extends Recipe{
    @IsNotEmpty()
    @Length(24)
    _id:string
}
export class DeleteWithParam{
    @IsNotEmpty()
    @Length(24)
    _id:string
}
export class GetParam extends DeleteWithParam{

}