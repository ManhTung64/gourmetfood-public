import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { INotification } from '../../main.microservice/user/notification/notification.model';
import { Ads } from 'src/sponsor.microservice/ads/ads.dto';

@Injectable()
export class RedisService {
    constructor(
        @Inject('WRITER_REDIS_CLIENT') private readonly wredisClient: Redis,
        @Inject('SUBSCRIBER_REDIS_CLIENT') private readonly listenRedisClient: Redis,
    ) { }

    public async setValue(key: string, value: any): Promise<string | null> {
        try {
            return await this.wredisClient.set(key,value)
        } catch (error) {
            console.log(error)
            return null
        }
    }
    public async getValue(key: string): Promise<string | null> {
        try {
            const data = await this.wredisClient.get(key)
            return JSON.parse(data)
        } catch (error) {
            console.log(error)
            return null
        }
    }
    public pub(channel:string, message:INotification){
        try{
            const mess:string = JSON.stringify(message);
            this.wredisClient.publish(channel,mess)
        }catch(error){
            console.log(error)
            return null
        }
    }
    public pubSponsor(channel:string, ads:Ads){
        try{
            const mess:string = JSON.stringify(ads);
            this.wredisClient.publish(channel,mess)
        }catch(error){
            console.log(error)
            return null
        }
    }
}
