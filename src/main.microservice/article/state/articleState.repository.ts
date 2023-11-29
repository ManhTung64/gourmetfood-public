import { Repository } from "../../../../base/base.repository"
import { IArticleState } from "./state.model"
import { Model } from "mongoose"
import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"

@Injectable()
export class ArticleStateRepository extends Repository<IArticleState>{
    constructor(@InjectModel('ArticleState') private readonly articleStateModel:Model<IArticleState>){
      super(articleStateModel)
    }
    public findStateWithUserIdAndObjectId = async(userId:string,articleId:string):Promise<boolean>=>{
        try{
            const find:IArticleState[] = this.data.filter(data=>{
                return data.Account_id.toString() == userId && data.Article_id.toString() == articleId
            })
            if (find.length > 0) return this.value.Existed()
            else return this.value.NotExisted()
        }catch(error){
            console.log(error)
            return this.value.Fail()
        }
    }
}