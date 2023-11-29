import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io'
import { AuthService } from "./main.microservice/auth/auth.service";
import { ArticleState, SocketStateData } from "./main.microservice/article/dto/state.dto";
import { ArticleStateService } from "./main.microservice/article/state/articleState.service";
import { IArticleState } from "./main.microservice/article/state/state.model";
import { FoodService } from "./main.microservice/algorithm/food.service";
import { Food, SearchCategory, SearchFood, SocketFoodData } from "./main.microservice/algorithm/dto/food.dto";
import { Inject, Module, ValidationPipe } from "@nestjs/common";
import { AuthModule } from "./main.microservice/auth/auth.module";
import { ArticleModule } from "./main.microservice/article/article.module";
import { AlgorithmModule } from "./main.microservice/algorithm/algorithm.module";
import { CommentService } from "./main.microservice/comment/comment.service";
import { CommentModule } from "./main.microservice/comment/comment.module";
import { SocketCommentData, SocketCommentInputData, UpdateCommentData } from "./main.microservice/comment/dto/articleComment.dto";
import { IRecipeComment } from "./main.microservice/comment/recipeComment/recipeComment.model";
import { RecipeModule } from "./main.microservice/recipe/recipe.module";
import { RecipeService } from "./main.microservice/recipe/recipe.service";
import { RatingRecipeInput } from "./main.microservice/recipe/dto/rating.dto";
import { IRatingRecipe } from "./main.microservice/recipe/rating_recipe/rating.model";
import { CreateMessage, GetMessageByIndex } from "./main.microservice/message/dto/message.dto";
import { MessageModule } from "./main.microservice/message/message.module";
import { MessageService } from "./main.microservice/message/message.service";
import { IMessage } from "./main.microservice/message/message.model";
import { UserModule } from "./main.microservice/user/user.module";
import { FollowService } from "./main.microservice/user/follow/follow.service";
import { CreateFollow } from "./main.microservice/user/dto/follow.dto";
import { IFollow } from "./main.microservice/user/follow/follow.model";
import { RedisModule } from "./otherModule/redis/redis.module";
import { Redis } from "ioredis";
import { SearchService } from "./main.microservice/algorithm/search.service";
import { GetHistorySearch, InputGetHistory, InputSearch, SearchResult } from "./main.microservice/algorithm/dto/search.dto";

@Module({
    imports:[AuthModule,ArticleModule, AlgorithmModule, CommentModule, RecipeModule, MessageModule, UserModule, RedisModule]
})

@WebSocketGateway()
export class EventGateWay implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server
    private NOT_FOUND = 0
    constructor(
        @Inject('SUBSCRIBER_REDIS_CLIENT') private readonly redisClient: Redis,
        private readonly authService: AuthService,
        private readonly articleStateService: ArticleStateService,
        private readonly foodService: FoodService,
        private readonly commentService:CommentService,
        private readonly recipeService:RecipeService,
        private readonly messageService:MessageService,
        private readonly followService:FollowService,
        private readonly searchService:SearchService
    ) {
    }
    afterInit(server: any) {
        //sub to listen notification
        this.redisClient.subscribe("notification")
        this.redisClient.on("message",(channel,message)=>{
            const data:IFollow = JSON.parse(message)
            this.server.emit("notification",data)
        })
    }
    handleConnection(socket: Socket) {
    }
    handleDisconnect(client: any) {

    }
    @SubscribeMessage('search')
    public async search(socket: Socket, @MessageBody() data: InputSearch) {
        try {
            await new ValidationPipe().transform(data, { type: 'body', metatype: InputSearch})
            const success:SearchResult = (data.isHashtag)? this.searchService.searchHashtag(data) : this.searchService.search(data)
            if (success){
                this.server.emit('search',{success:true,data:success})
            } else this.server.emit('search',{success:false})

        } catch(error) {
            console.log(error)
            const data: SocketStateData = { success: false, message: "Error", data: null }
            this.server.emit('error', data)
        }
    }
    @SubscribeMessage('getHistory')
    public async getHistory(socket: Socket, @MessageBody() data: InputGetHistory) {
        try {
            await new ValidationPipe().transform(data, { type: 'body', metatype: InputGetHistory})
            const success:GetHistorySearch = this.searchService.getListSearch(data._id)
            if (success) this.server.emit('history',{success:true,data:success})
            else this.server.emit('history',{success:false})
        } catch(error) {
            console.log(error)
            const data: SocketStateData = { success: false, message: "Error", data: null }
            this.server.emit('error', data)
        }
    }
    @SubscribeMessage('changeFollow')
    public async changeFollow(socket: Socket, @MessageBody() data: CreateFollow) {
        try {
            await new ValidationPipe().transform(data, { type: 'body', metatype: CreateFollow})
            const success:IFollow | string = await this.followService.changeFollowState(data)
            if (typeof success === 'string') this.server.emit('unFollow',{success:true,data:success})
            else if(typeof success === 'object') this.server.emit('follow',{success:true, data:success})
            else throw Error()
        } catch(error) {
            console.log(error)
            const data: SocketStateData = { success: false, message: "Error", data: null }
            this.server.emit('error', data)
        }
    }
    @SubscribeMessage('setheart')
    public async setHeartState(socket: Socket, @MessageBody() data: ArticleState) {
        try {
            await new ValidationPipe().transform(data, { type: 'body', metatype: ArticleState })
            this.changeState(socket, data)
        } catch(error) {
            console.log(error)
            const data: SocketStateData = { success: false, message: "Error", data: null }
            this.server.emit('error', data)
        }
    }
    @SubscribeMessage('searchfood')
    public async searchFood(socket: Socket, @MessageBody() data: SearchFood) {
        try {
            await new ValidationPipe().transform(data, { type: 'body', metatype: SearchFood })
            let key:string = ''
            if (data.keyword != null) key = data.keyword.toLowerCase()
            const foodResult:Food[] = this.foodService.getSearchFood(data.category.toLowerCase() + ' '+ key)
            var SocketFoodData: SocketFoodData
            if (foodResult) {
                SocketFoodData = { success: true, data: foodResult, _id: data._id, keyword: data.keyword, category:data.category}
            } else {
                SocketFoodData = { success: true, data: this.NOT_FOUND, _id: data._id, keyword: data.keyword, category:data.category }
            }
            this.server.emit('searchfood', SocketFoodData)
        } catch(error) {
            console.log(error)
            const data: SocketStateData = { success: false, message: "Error", data: null }
            this.server.emit('error', data)
        }
    }
    @SubscribeMessage('getcategories')
    public async searchCategories(socket: Socket, @MessageBody() data: SearchCategory) {
        try {
            await new ValidationPipe().transform(data, { type: 'body', metatype: SearchCategory })
            const categoryResult:string[] = this.foodService.getCategories()
            var SocketCategoryData: any
            if (categoryResult.length) {
                SocketCategoryData = { success: true, data: categoryResult, _id: data._id}
            } else {
                SocketCategoryData = { success: false, data: this.NOT_FOUND, _id: data._id}
            }
            this.server.emit('categories', SocketCategoryData)
        } catch(error) {
            console.log(error)
            const data: SocketStateData = { success: false, message: "Error", data: null }
            this.server.emit('error', data)
        }
    }
    @SubscribeMessage('add_article_comment')
    public async addArticleComment(socket: Socket, @MessageBody() data: SocketCommentInputData) {
        try {
            await new ValidationPipe().transform(data, { type: 'body', metatype: SocketCommentInputData })
            const comment:unknown = await this.commentService.getArticleComment(data._id)
            let socketData:SocketCommentData = null
            if (comment == null) throw Error
            else socketData = {comment:comment,success:true}
            this.server.emit('addcomment', socketData)
        } catch(error) {
            console.log(error)
            const data: SocketStateData = { success: false, message: "Error", data: null }
            this.server.emit('error', data)
        }
    }
    @SubscribeMessage('update_article_comment')
    public async updateArticleComment(socket: Socket, @MessageBody() data: UpdateCommentData) {
        try {
            await new ValidationPipe().transform(data, { type: 'body', metatype: UpdateCommentData })
            const comment:unknown = await this.commentService.getArticleComment(data._id)
            let socketData:SocketCommentData = null
            if (comment == null) throw Error
            else socketData = {comment:comment,success:true}
            this.server.emit('updatecomment', socketData)
        } catch(error) {
            console.log(error)
            const data: SocketStateData = { success: false, message: "Error", data: null }
            this.server.emit('error', data)
        }
    }
    @SubscribeMessage('add_recipe_comment')
    public async addRecipeComment(socket: Socket, @MessageBody() data: SocketCommentInputData) {
        try {
            await new ValidationPipe().transform(data, { type: 'body', metatype: SocketCommentInputData })
            // const comment:IRecipeComment | null = await this.commentService.getRecipeComment(data._id)
            let socketData:SocketCommentData = null
            // if (comment == null) throw Error
            socketData = {comment:data._id,success:true}
            this.server.emit('add_recipe_comment', socketData)
        } catch(error) {
            console.log(error)
            const data: SocketStateData = { success: false, message: "Error", data: null }
            this.server.emit('error', data)
        }
    }
    @SubscribeMessage('update_recipe_comment')
    public async updateRecipeComment(socket: Socket, @MessageBody() data: UpdateCommentData) {
        try {
            await new ValidationPipe().transform(data, { type: 'body', metatype: UpdateCommentData })
            const comment:IRecipeComment | null = await this.commentService.getRecipeComment(data._id)
            let socketData:SocketCommentData = null
            if (comment == null) throw Error
            else socketData = {comment:comment,success:true}
            this.server.emit('update_recipe_comment', socketData)
        } catch(error) {
            console.log(error)
            const data: SocketStateData = { success: false, message: "Error", data: null }
            this.server.emit('error', data)
        }
    }
    @SubscribeMessage('delete_recipe_with_comments')
    public async deletecipe(socket: Socket, @MessageBody() _id:string) {
        try {
            if (!_id || _id.length != 24) throw new Error()
            const success:boolean = await this.recipeService.deleteRecipeWithId(_id)
            let socketData:SocketStateData = null
            if (!success) throw Error
            else socketData = {data:_id,success:true,message:"delete successful"}
            this.server.emit('delete_recipe_with_comments', socketData)
        } catch(error) {
            console.log(error)
            const data: SocketStateData = { success: false, message: "Error", data: null }
            this.server.emit('error', data)
        }
    }
    @SubscribeMessage('create_Or_Update_Rating')
    public async rating(socket: Socket, @MessageBody() data:RatingRecipeInput) {
        try {
            await new ValidationPipe().transform(data, { type: 'body', metatype: RatingRecipeInput })
            const success:IRatingRecipe | null = await this.recipeService.addNewOrUnsetRating(data.rating,data.Account_id)
            let socketData:SocketStateData = null
            if (!success) throw Error
            else socketData = {data:success,success:true,message:"successful"}
            this.server.emit('create_Or_Update_Rating', socketData)
        } catch(error) {
            console.log(error)
            const data: SocketStateData = { success: false, message: "Error", data: null }
            this.server.emit('error', data)
        }
    }
    @SubscribeMessage('sendMessage')
    public async sendMessage(socket: Socket, @MessageBody() data:CreateMessage) {
        try {
            await new ValidationPipe().transform(data, { type: 'body', metatype: CreateMessage })
            const success:IMessage | null = await this.messageService.addMessage(data)
            let socketData:SocketStateData = null
            if (!success) throw Error
            else socketData = {data:success,success:true,message:"successful"}
            this.server.emit('receiveMessage', socketData)
        } catch(error) {
            console.log(error)
            const data: SocketStateData = { success: false, message: "Error", data: null }
            this.server.emit('error', data)
        }
    }
    @SubscribeMessage('getMessageByIndex')
    public async getMessage(socket: Socket, @MessageBody() data:GetMessageByIndex) {
        try {
            await new ValidationPipe().transform(data, { type: 'body', metatype: GetMessageByIndex })
            const success:IMessage[] | null = this.messageService.getMessage(data)
            let socketData:SocketStateData = null
            if (!success) throw Error
            else socketData = {data:success,success:true,message:"successful"}
            this.server.emit('getMessage', socketData, data)
        } catch(error) {
            console.log(error)
            const data: SocketStateData = { success: false, message: "Error", data: null }
            this.server.emit('error', data)
        }
    }
    private async changeState(socket: Socket, state: ArticleState) {
        try {
            const result: IArticleState | boolean = await this.articleStateService.createNewOrUnState(state)    
            if (result == false) {
                const data: SocketStateData = { success: false, message: "Error", data: null }
                this.server.emit('error', data)
            }
            else if (result == true) {
                const data: SocketStateData = { success: true, message: "Delete Successful", data: result }
                this.server.emit('deleteheart', data)
            }
            else {
                const data: SocketStateData = { success: true, message: "Add Successful", data: result }
                this.server.emit('addheart', data)
            }
        } catch(error) {
            console.log(error)
            const data: SocketStateData = { success: false, message: "Error", data: null }
            this.server.emit('error', data)
        }
    }
    
}