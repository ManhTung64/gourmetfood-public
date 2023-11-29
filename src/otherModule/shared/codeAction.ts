import { Injectable } from "@nestjs/common"

interface codeItem{
    email:string,
    code:string,
    limit:Date
}
@Injectable()
export class codeAction{
    private listCode:Array<codeItem> = [] 
    private LIMIT_TIME_MILI:number = 3 * 60 * 1000
    public addCode = (email:string,code:string):boolean=>{
        this.listCode.push({email,code,limit:new Date()})
        return true
    } 
    public verifyCode = (code:string,email:string):boolean=>{
        let result:boolean = false
        for(let i = 0; i < this.listCode.length; i++){
            if(this.listCode[i].email == email && this.limitTime(new Date(),this.listCode[i].limit)){
                if(this.listCode[i].code == code){
                    this.listCode.splice(i,1)
                    result = true
                    break
                } 
            }
        }
        return result
    }
    private limitTime = (firstTime:Date,secondTime:Date):boolean=>{
        const timeDif = firstTime.getTime() - secondTime.getTime()
        if(timeDif < this.LIMIT_TIME_MILI) return true
        else return false
    }
    public createCode = ():string =>{
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        let code = ''
        const length = 6
        for (let i = 0; i < length; i++) {
            const indexRandom = Math.floor(Math.random() * characters.length)
            code += characters.charAt(indexRandom)
        }
        return code
    }
}