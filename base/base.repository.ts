import {Model} from 'mongoose'
import { ConstValue } from '../src/otherModule/shared/defaultValues'
import { RedisService } from '../src/otherModule/redis/redis.service'
export class Repository<T extends Document>{
    protected data:T[] | any 
    protected redisValue:string
    protected value:ConstValue
    constructor(private readonly model: Model<T>, private readonly redisService?:RedisService,private name?:string){
        this.value = new ConstValue()
        new Promise(()=>this.updateData()) 
    }
    private pushToRedis = async (value:string):Promise<boolean>=>{
        try{
          var dataRedis = this.data
          var success = await this.redisService.setValue(value,JSON.stringify(dataRedis))
          if (success) return true
        }catch(error){
          console.log(error)
          return false
        }
      }
    protected updateData = async ()=>{
        try{
            this.data = await this.model.find()
            if (this.redisService) new Promise(()=>this.pushToRedis(this.name))
        }catch(error){
            console.log(error)
            this.updateData()
        }
    }
    protected updateAtId = (object: any, isDelete?:boolean) => {
        for (let i = 0; i < this.data.length; i++) {
          if (this.data[i]._id.toString() === object._id.toString()) {
            if (isDelete) this.data[i].pop()
            else this.data[i] = object
            break
          }
        }
      }
    public getAll = ():Array<T> | null=>{
        try{
            return this.data    
        }catch(error){
            console.log(error)
            return null
        }
    }
    public findById = (_id:string):T | null => {
        try{
            if ( !this.data || this.data.length == 0) return null
            const find:T | null = this.data.find(data => {
                return data._id.toString() == _id})
                
            if (!find) throw Error()
            else return find
        }catch(error){
            console.log(error)
            return null
        }
    }
    public addNew = async (newData:unknown):Promise<T | null> => {
        try{
            const res:T | null = await new this.model(newData).save()
            if (res) this.data.push(res)
            return res
        }catch(error){
            console.log(error)
            return null
        }
    }
    public delete = async (_id:string):Promise<boolean> =>{
        try{
            if( await this.model.deleteOne({_id:_id}) ) 
            {
                this.data = this.data.filter(item => item._id.toString() !== _id)
                return true
            } else return false
        }catch(error){
            console.log(error)
            return false
        }
    }
    public deleteAndGet = async (_id:string):Promise<T | null> =>{
        try{
            const result: T| null = await this.model.findOneAndDelete({_id:_id}) 
            if (result)
            {
                this.data = this.data.filter(item => item._id.toString() !== _id)
                return result
            } else return null
        }catch(error){
            console.log(error)
            return null
        }
    }
    public deleteMany = async (list:Array<any>):Promise<boolean>=>{
        try{
            const objectsId = list.map(element=> element._id)
            if (await this.model.deleteMany({ _id: { $in: objectsId } })){
                this.updateData()
                return true
            } 
            else throw Error("delete many failed")
        }catch(error){
            console.log(error)
            return false
        }
    }
}