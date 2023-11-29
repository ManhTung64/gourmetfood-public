import { IsNotEmpty, IsOptional, Length } from "class-validator"

export class SearchFood {
    @IsNotEmpty()
    @Length(24)
    _id: string
    @IsOptional()
    keyword: string
    @IsNotEmpty()
    category:string
}
export class SearchCategory {
    @IsNotEmpty()
    @Length(24)
    _id: string
}
export class SocketFoodData extends SearchFood{
    success:boolean
    data:unknown
}
export class Food{
    category:string
    name:string
    units:Unit[]
}
export class Unit{
    calo:number
    unit:string
    protein:number //F
    carbs:number   //I
    fat:number     //G
    sugar:number //K
    fiber:number //J
    sodium:number //Q
}