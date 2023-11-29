import {IsNotEmpty} from "class-validator";
export class LoginDto {
    @IsNotEmpty({ message: 'Username or password is required' })
    username:string
    @IsNotEmpty({ message: 'Username or password is required' })
    password:string
}