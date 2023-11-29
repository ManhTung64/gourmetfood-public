import { IsNotEmpty, IsOptional, Length, Min, MinLength } from "class-validator"

export class RebuildBreakfast{
    @IsOptional()
    @Length(24)
    user_id:string
}
export class RebuildMainMeal{
    @IsOptional()
    @Length(24)
    user_id:string
    @IsNotEmpty()
    isDinner:boolean
}
export class DefaultMealPlan{
    @IsOptional()
    @Length(24)
    User_id:string
    @IsNotEmpty()
    name:string
}
export class CreateMealPlan{
    @IsNotEmpty()
    @Length(24)
    Category_id:string
    @IsOptional()
    @Length(24)
    User_id:string
    @IsNotEmpty()
    name:string
    @IsNotEmpty()
    @Min(1)
    nPerson:number
}
export class CreateDay{
    meals:CreateMeal[]
}
export class CreateMeal{
    @IsNotEmpty()
    name:MealName
    @IsNotEmpty()
    recipes:[]
}
export enum MealName{
    bf = 'Breakfast',
    lunch = 'Lunch',
    dinner = 'Dinner',
    side = 'Side'
}
export class BodyCreateMealPlan{
    mealplan:CreateMealPlan
    days:CreateDay[]
}
export class MealPlanCategory {
    @IsNotEmpty()
    @MinLength(3)
    name:string 
}
export class UpdateMealPlanCategory {
    @IsNotEmpty()
    @MinLength(3)
    name:string
    @IsNotEmpty()
    @Length(24)
    _id:string
}