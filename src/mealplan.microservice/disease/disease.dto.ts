import { IsNotEmpty, IsOptional } from "class-validator"

export class CreateDisease{
    @IsNotEmpty()
    name:string
    @IsOptional()
    calories?:number
    @IsOptional()
    protein?:number
    @IsOptional()
    fat?:number
    @IsOptional()
    sugar?:number
    @IsOptional()
    lipit?:number
    @IsOptional()
    carbs?:number
    @IsOptional()
    sodium?:number
    @IsOptional()
    blackFoodList?:string[]
    @IsOptional()
    healthFoodList?:string[]
}