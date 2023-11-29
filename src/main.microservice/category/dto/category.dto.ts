import { IsNotEmpty, Length } from "class-validator"
import { group } from "console"

export class BaseCategory{
    @IsNotEmpty()
    name:string
    image:string
    description:string
}
export class CategoryWithId{
    @IsNotEmpty()
    @Length(24)
    _id:string
    name:string
    image:string
    description:string
}