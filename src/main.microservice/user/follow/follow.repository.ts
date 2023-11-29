import { Repository } from "../../../../base/base.repository";
import { IFollow } from "./follow.model";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class FollowRepository extends Repository<IFollow>{
    constructor(@InjectModel('Follow') private readonly followModel:Model<IFollow>){
        super(followModel)
    }
    public checkExisted = (following_id:string,follower_id:string):IFollow=>{
        try{
            return this.data.find(data=>{return follower_id == data.follower_id.toString() && following_id == data.following_id.toString()})
        }catch(error){
            console.log(error)
            return null
        }
    }
    public findByFollowingId = (following_id:string):IFollow[]=>{
        try{    
            return this.data.filter(data=>{return following_id == data.following_id.toString()})
        }catch(error){
            console.log(error)
            return null
        }
    }
    public findByFollowerId = (follower_id:string):IFollow[]=>{
        try{
            return this.data.filter(data=>{return follower_id == data.follower_id.toString()})
        }catch(error){
            console.log(error)
            return null
        }
    }
}