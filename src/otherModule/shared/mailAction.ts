import {createTransport} from 'nodemailer'
import {config} from 'dotenv'
import { Injectable } from "@nestjs/common"
config()

@Injectable()
export class mailAction{
    private mail_account
    private mail_password
    constructor(){
        this.mail_account = process.env.MAIL_ACCOUNT
        this.mail_password = process.env.MAIL_PASSWORD
    }
    public sendMail = async(to:string,subject:string,text:any):Promise<boolean>=>{
        try{
            const transporter = createTransport({
                service: 'gmail',
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                  user: this.mail_account,
                  pass: this.mail_password
                }
              })
              const mailOptions = {
                from: this.mail_account,
                to:to,
                subject: subject,
                html: text
              }
              if(await transporter.sendMail(mailOptions)) return true
              else return false
        }catch(error){
            console.log(error)
            return false
        }
    }
}