import { Repository } from "../../../../base/base.repository";
import { IFamily } from "./family.model";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Injectable } from "@nestjs/common";

@Injectable()
export class FamilyRepository extends Repository<IFamily>{
    constructor(@InjectModel('UserFamily') private readonly familyModel:Model<IFamily>){
        super(familyModel)
    }
}