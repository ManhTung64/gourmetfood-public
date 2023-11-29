import {IsNotEmpty} from "class-validator";
export class createActivityMode {
    @IsNotEmpty()
    coefficient:number
    @IsNotEmpty()
    description:string
}