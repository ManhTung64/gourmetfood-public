import { Repository } from "../../../../base/base.repository";
import { IRole } from "./role.model";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";

@Injectable()
export class RoleRepository extends Repository<IRole>{
    constructor(@InjectModel('Role') private readonly roleModel: Model<IRole>) {
        super(roleModel)
    }
    public findByRole = (role: string): string => {
        try{
            const Irole:IRole = this.data.find(data=>{ return data.role == role})
            if (Irole) return Irole._id.toString()
            else return null
        }catch(error){
            console.log(error)
            return null
        }
    }
}