import { Injectable } from "@nestjs/common";
import { CreateFollow } from "../dto/follow.dto";
import { FollowRepository } from "./follow.repository";
import { IFollow } from "./follow.model";
import { NotificationService } from "../notification/notification.service";
import { resolve } from "path";
import { rejects } from "assert";

@Injectable()
export class FollowService{
    constructor(private readonly repository:FollowRepository, private readonly notificationService:NotificationService){

    }
    public changeFollowState = async (followData:CreateFollow):Promise<IFollow | string>=>{
        try{
            if (followData.follower_id == followData.following_id) return null
            const follow:IFollow = this.repository.checkExisted(followData.following_id,followData.follower_id)
            if (follow && await this.repository.delete(follow._id.toString())) return follow._id.toString()
            else {
                new Promise((resolve,reject)=>{
                    if (!this.notificationService.createFollowerNotification(followData)) reject(new Error("Follow failed"))
                })
                const newFollow:IFollow = await this.repository.addNew(followData)
                if (newFollow) return newFollow
                else throw new Error("Follow failed")
            }
            
        }catch(error){
            console.log(error)
            return null
        }
    }
    public getFollowers = (following_id:string):IFollow[]=>{
        try{
            return this.repository.findByFollowingId(following_id)
        }catch(error){
            console.log(error)
            return null
        }
    }
    public getFollowings = (follower_id:string):IFollow[]=>{
        try{
            return this.repository.findByFollowerId(follower_id)
        }catch(error){
            console.log(error)
            return null
        }
    }
}