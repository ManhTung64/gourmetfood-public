import { IsNotEmpty, IsOptional, Length, Max, Min, MinLength } from "class-validator"

export class CreateUserHealth{
    @IsOptional()
    @Length(24)
    User_id:string
    @IsNotEmpty()
    isMale:boolean
    @IsNotEmpty()
    @Min(0)
    @Max(110)
    age:number
    @IsNotEmpty()
    @Min(0)
    high:number
    @Min(0)
    weight:number
    @Min(0)
    @Max(1)
    @IsOptional()
    loseWeight?:number
    @IsOptional()
    @Length(24)
    ActivityMode_id:string
    @IsOptional()
    calories?:number
    familyCalories?:number
    @IsNotEmpty()
    @Min(1)
    @Max(5)
    meal:number
    @Length(24)
    @IsOptional()
    Disease_id?:string
    blackFoodList?: string[]
}

export class CreateUserHealthAfterRegister{
    @IsOptional()
    @Length(24)
    User_id:string
    @IsNotEmpty()
    @Min(0)
    high:number
    @IsNotEmpty()
    @Min(0)
    weight:number
    @IsOptional()
    @Length(24)
    Disease_id?:string
    @IsOptional()
    blackFoodList?: string[]
}