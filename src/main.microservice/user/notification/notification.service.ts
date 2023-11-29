import { Injectable } from "@nestjs/common";
import { CreateFollow } from "../dto/follow.dto";
import { IUser } from "../user.model";
import { UserRepository } from "../user.repository";
import { INotification } from "./notification.model";
import { NotificationRepository } from "./notification.repository";
import { FollowRepository } from "../follow/follow.repository";
import { IFollow } from "../follow/follow.model";
import { IArticle } from "../../article/article.model";
import { ArticleState } from "../../article/dto/state.dto";
import { RedisService } from "../../../otherModule/redis/redis.service";

@Injectable()
export class NotificationService {
    constructor(private readonly repository: NotificationRepository,
        private readonly userRepository: UserRepository,
        private readonly followRepository: FollowRepository,
        private readonly redisService: RedisService) {

    }
    public createFollowerNotification = async (followData: CreateFollow): Promise<boolean> => {
        try {
            const user: IUser = this.userRepository.findById(followData.follower_id)
            const message: string = user.name + " started following you"
            const data: unknown = { userId: followData.following_id.toString(), message: message,date:new Date() }
            this.redisService.pub("notification", await this.repository.addNew(data))
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }
    public createFollowingUploadArticleNotification = async (following_id: string): Promise<boolean> => {
        try {
            const followers: IFollow[] = this.followRepository.findByFollowingId(following_id)
            if (followers.length == 0) return null // no any follower

            const following: IUser = this.userRepository.findById(following_id) // find to get name following

            const promises = followers.map((follower) => {
                const message = `${following.name} posted a new article`;
                const data = { userId: follower._id.toString(), message: message,date:new Date() };
                return this.repository.addNew(data);
            });
            Promise.all(promises)
                .then((results: INotification[]) => {
                    results.forEach((notification) => {
                        this.redisService.pub('notification', notification);
                    });
                })
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }
    public createReportNotification = async (title: string, userId: string): Promise<boolean> => {
        try {
            const message: string = "Your content: " + title + " has been removed for violating community standards."
            const data: unknown = { userId: userId, message: message,date:new Date() }
            this.redisService.pub("notification", await this.repository.addNew(data))
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }
    public createCommentNotification = async (userComment_id: string, post_name: string, user_id: string): Promise<boolean> => {
        try {
            if (userComment_id == user_id) return true
            const user: IUser = this.userRepository.findById(userComment_id)
            const message: string = user.name + " just commented to your content " + post_name
            const data: unknown = { userId: user_id, message: message,date:new Date() }
            this.redisService.pub("notification", await this.repository.addNew(data))
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }
    public createHeartNotification = async (articleState: ArticleState, article: IArticle): Promise<boolean> => {
        try {
            if (articleState.Account_id.toString() == article.userId.toString()) return true
            const user: IUser = this.userRepository.findById(articleState.Account_id.toString())
            const message: string = user.name + " just felt love for your article " + article.title
            const data: unknown = { userId: article.userId, message: message,date:new Date() }
            this.redisService.pub("notification", await this.repository.addNew(data))
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }
}