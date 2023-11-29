import { Injectable } from "@nestjs/common";
import { Repository } from "../../../../base/base.repository";
import { IArticleComment } from "./articleComment.model";
import { Model, ObjectId, Schema, Types } from "mongoose";
import { ArticleComment, ArticleCommentReturn } from "../dto/articleComment.dto";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class ArticleCommentRepository extends Repository<IArticleComment>{
    constructor(@InjectModel('ArticleComment') private readonly articleComment:Model<IArticleComment>){
        super(articleComment)
    }
    public updateById = async (comment:ArticleComment):Promise<IArticleComment | null>=>{
        try{
            const update:IArticleComment = await this.articleComment.findByIdAndUpdate(comment._id,{comment:comment.comment,timeComment:new Date(),Is_Censored:false},{returnDocument:'after'})
            if (update) this.updateAtId(update)
            return update
        }catch(error){
            console.log(error)
            return null
        }
    }
    public getArticleComment = async (_id:string):Promise<unknown>=>{
        try{
            return await this.articleComment.aggregate([
                {
                    $match:{_id:new Types.ObjectId(_id)}
                },
                {
                    $lookup:{
                        from:'files',
                        localField:'_id',
                        foreignField: 'ArticleComment_id',
                        as:'comment_files'
                    }
                },
                {
                    $lookup:{
                        from:'users',
                        localField:'Account_id',
                        foreignField: '_id',
                        as:'user'
                    }
                },
                {
                    $project:{
                        _id:1,
                        Account_id:1,
                        Article_id:1,
                        comment:1,
                        timeComment:1,
                        usercomment:{
                            $map:{
                                input:'$user',
                                as:'user',
                                in:{
                                    avatar:'$$user.avatar',
                                    name:'$$user.name',
                                    _id:'$$user._id'
                                }
                            }
                        },
                        files:'$comment_files.files'
                    }
                }
            ])
        }catch(error){
            console.log(error)
            return null
        }
    }
    public updateIsCensored = async (_id: string, Is_Censored: boolean): Promise<boolean> => {
        try {
          const cmt: IArticleComment | null = await this.articleComment.findByIdAndUpdate(_id, { Is_Censored: Is_Censored })
          if (!cmt) return this.value.Fail()
          else {
            this.updateAtId(cmt)
            return this.value.Success()
          }
        } catch (error) {
          console.log(error)
          return this.value.Fail()
        }
      }
    
}