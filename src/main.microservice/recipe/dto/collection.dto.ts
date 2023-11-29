import { IsNotEmpty, Length } from "class-validator"

export class CreateDefaultCollection{
    name:string
    Account_id:string
}
export class CreateCollection{
    @IsNotEmpty()
    name:string
    @IsNotEmpty()
    @Length(24)
    Account_id:string
}
export class UpdateCollection extends CreateCollection{
    @IsNotEmpty()
    @Length(24)
    _id:string
}
export class RemoveCollection {
    @IsNotEmpty()
    @Length(24)
    Account_id:string
    @IsNotEmpty()
    @Length(24)
    _id:string
}