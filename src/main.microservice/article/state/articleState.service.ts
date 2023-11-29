import { Injectable } from "@nestjs/common"
import { ArticleStateRepository } from "./articleState.repository"
import { ArticleState } from "../dto/state.dto"
import { IArticleState } from "./state.model"
import { ConstValue } from "../../../otherModule/shared/defaultValues"
import { ArticleRepository } from "../article.repository"
import { NotificationService } from "../../user/notification/notification.service"

@Injectable()
export class ArticleStateService{
    constructor(private readonly repository:ArticleStateRepository, private readonly value:ConstValue,
        private readonly articleRepository:ArticleRepository, private readonly notificationService:NotificationService){

    }
    public createNewOrUnState = async (state:ArticleState):Promise<IArticleState | boolean> => {
        try{
            if (!state.Article_id || !state.Account_id || !state.state) throw new Error('Missing information')
            else if (!this.checkValidState(state.state)) throw new Error('State is invalid')
            if (!state._id && !await this.repository.findStateWithUserIdAndObjectId(state.Account_id.toString(),state.Article_id.toString())) {
                new Promise(()=>{this.notificationService.createHeartNotification(state,this.articleRepository.findById(state.Article_id))})
                const thisState:IArticleState | null = await this.repository.addNew(state)
                return (thisState) ? thisState : this.value.Fail()
            }
            else if (state._id && await this.repository.delete(state._id)) return this.value.Success()
            else return this.value.Fail()
        }catch(error){
            console.log(error)
            return this.value.Fail()
        }
    }
    private checkValidState = (state:string):boolean=>{
            if (!state) return this.value.Fail()
            return state == 'heart' ? this.value.Valid():this.value.Invalid()
    }
}