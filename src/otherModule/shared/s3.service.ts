import {GetObjectCommand, ObjectCannedACL, PutObjectAclCommand, PutObjectCommand } from "@aws-sdk/client-s3" // working with file in amazon
import { getSignedUrl } from  "@aws-sdk/s3-request-presigner" // create access url
import s3Config from "../../configurations/s3.config"
import { Injectable }from '@nestjs/common';
import { UploadFile } from "../../main.microservice/file/dto/file.dto"
import {config} from 'dotenv'
config()
@Injectable()
export class S3 {
    private defaultAvatar  = 'https://i.stack.imgur.com/l60Hf.png'
    private bucketName:string = 'webep'
    private avatarFolder:string = 'Avatar/'
    private Expries:Date = new Date('2026-01-01T00:00:00Z')

    public getDefaulAvatar = ()=>{
        return this.defaultAvatar
    }
   private generateRandom8DigitNumber() {
        const min = 10000000; 
        const max = 99999999; 
        const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        return randomNumber;
      }
    private createParamsUpload = (file:UploadFile)=>{
        const params = {
            Bucket: this.bucketName,
            Key: `${this.avatarFolder}${this.generateRandom8DigitNumber()}`,
            Body: file.buffer,
            ContentType: file.mimetype,
            Expires:this.Expries,
        }
        return params
    }
    // public getURL = async(params:any):Promise<string>=>{
    //     try{
    //        return await getSignedUrl(s3Config, new GetObjectCommand(params), { expiresIn: 604800 })
    //     }catch(error){
    //         console.log(error)
    //         return ''
    //     }
    // }
    public UploadOneFile = async(file:UploadFile):Promise<string>=>{
        try{
            if(!file) throw new Error('Missing file')
            let params = this.createParamsUpload(file)
            await s3Config.send(new PutObjectCommand(params))

            const aclParams = {
                Bucket: this.bucketName,
                Key: params.Key,
                ACL: ObjectCannedACL.public_read
            };
            await s3Config.send(new PutObjectAclCommand(aclParams));
            
            return `https://${this.bucketName}.s3.${process.env.REGION}.amazonaws.com/` + params.Key 
         }catch(error){
            console.log(error)
            return ''
         }
    }
    public UploadManyFiles = async(files:Array<UploadFile>):Promise<Array<string>>=>{
        try{
            if(!files) throw new Error('Missing file')
            let urls:Array<string> = []
            for (let i:number = 0; i < files.length; i++){
                urls.push(await this.UploadOneFile(files[i]))
            }
            return urls
         }catch(error){
            console.log(error)
            return []
         }
    }
}

export default S3