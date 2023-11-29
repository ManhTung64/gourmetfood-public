import * as argon2 from "argon2"
import { ConstValue } from "./defaultValues"
import { Injectable } from "@nestjs/common"

@Injectable()
export class passwordAction{
    constructor(private readonly value:ConstValue){
        
    }
    public hashPassword = async(password:string):Promise<string>=>{
        try{
            const hashedPassword = await argon2.hash(password)
            return hashedPassword
        }catch(error){
            console.log(error)
            return ''
        }
    }
    public verifyPassword = async(userPassword:string,inputPassword:string):Promise<boolean>=>{
        try {
            if (await argon2.verify(userPassword, inputPassword)) return this.value.Success()
            else return this.value.Fail()
          } catch (error) {
            console.log(error)
            return this.value.Fail()
          }
    }
}
