import { IsNotEmpty, IsOptional, Length, Max, Min } from "class-validator"

export class RatingRecipe{
    @IsOptional()
    @Length(24)
    _id?:string
    @IsNotEmpty()
    @Length(24)
    Recipe_id:string
    @IsNotEmpty()
    @Min(1)
    @Max(5)
    rating:number
    @IsOptional()
    Category:string
    @IsOptional()
    @Length(24)
    Account_id:string
}
export class RatingRecipeInput{
    @IsNotEmpty()
    @Length(24)
    Account_id:string
    @IsNotEmpty()
    rating:RatingRecipe
}
export class DataRatingForDashboard{
    category:string[]
    rating:number[]
    count:number[]
    avgRating:number[]
}