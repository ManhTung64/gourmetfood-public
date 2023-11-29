import { Repository } from "../../../base/base.repository";
import { IArticle } from "./article.model";
import { Model, Types } from "mongoose";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { UpdateArticle } from "./dto/article.dto";
import { IFollow } from "../user/follow/follow.model";

@Injectable()
export class ArticleRepository extends Repository<IArticle> {
  constructor(@InjectModel('Article') private readonly articleModel: Model<IArticle>) {
    super(articleModel)
  }
  public updateArticleById = async (article: UpdateArticle): Promise<IArticle> => {
    try {
      const res: IArticle = await this.articleModel.findByIdAndUpdate(article._id, {
        title: article.title,
        content: article.content,
        hashtag: article.hashtag,
        Is_Censored: false
      }, { returnDocument: 'after' })
      if (!res) return null
      else {
        this.updateAtId(res)
        return res
      }
    } catch (error) {
      console.log(error)
      return null
    }

  }
  public findArticleWithAuthor = async (): Promise<IArticle[]> => {
    try {
      return await this.articleModel.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        }, {
          $addFields: {
            user: '$user'
          }
        }
      ])
    } catch (error) {
      console.log(error)
      return null
    }
  }
  public getListArticleForGlobal = async (index?: number): Promise<IArticle[] | boolean> => {
    try {
      if (index) var count: number = index * 10
      else count = 10
      return await this.articleModel.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        }, {
          $lookup: {
            from: 'files',
            localField: '_id',
            foreignField: 'Article_id',
            as: 'file'
          }
        }, {
          $lookup: {
            from: 'articlecomments',
            localField: '_id',
            foreignField: 'Article_id',
            as: 'comments'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'comments.Account_id',
            foreignField: '_id',
            as: 'commentUsers'
          }
        }, {
          $lookup: {
            from: 'files',
            localField: 'comments._id',
            foreignField: 'ArticleComment_id',
            as: 'files'
          }
        }, {
          $lookup: {
            from: 'articlestates',
            localField: '_id',
            foreignField: 'Article_id',
            as: 'states'
          }
        }, {
          $lookup: {
            from: 'articles',
            localField: 'Article_id',
            foreignField: '_id',
            as: 'articleRefer'
          }
        }, {
          $project: {
            title: 1,
            timeUpload: 1,
            content: 1,
            hashtag: 1,
            isShared: 1,
            Is_Censored: 1,
            userUpload: '$user',
            files: '$file',
            comment: {
              $map: {
                input: '$comments',
                as: 'comment',
                in: {
                  _id: '$$comment._id',
                  comment: '$$comment.comment',
                  timeComment: '$$comment.timeComment',
                  Article_id: '$$comment.Article_id',
                  usercomment: {
                    $arrayElemAt: [
                      {
                        $map: {
                          input: {
                            $filter: {
                              input: "$commentUsers",
                              as: "u",
                              cond: { $eq: ["$$u._id", "$$comment.Account_id"] }
                            }
                          },
                          as: "u",
                          in: {
                            _id: "$$u._id",
                            name: "$$u.name",
                            avatar: "$$u.avatar"
                          }
                        }
                      },
                      0
                    ]
                  },
                }
              }
            },
            states: '$states'
          }
        }, { $sort: { timeUpload: -1 } },
        { $limit: count },
      ])
    } catch (error) {
      console.log(error)
      return this.value.Fail()
    }
  }
  public getListArticleForFollowing = async (followings: Types.ObjectId[], index?: number): Promise<IArticle[] | boolean> => {
    try {
      if (index) var count: number = index * 10
      else count = 10
      return await this.articleModel.aggregate([
        {
          $match: {
            userId: { $in: followings },
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        }, {
          $lookup: {
            from: 'files',
            localField: '_id',
            foreignField: 'Article_id',
            as: 'file'
          }
        }, {
          $lookup: {
            from: 'articlecomments',
            localField: '_id',
            foreignField: 'Article_id',
            as: 'comments'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'comments.Account_id',
            foreignField: '_id',
            as: 'commentUsers'
          }
        }, {
          $lookup: {
            from: 'files',
            localField: 'comments._id',
            foreignField: 'ArticleComment_id',
            as: 'files'
          }
        }, {
          $lookup: {
            from: 'articlestates',
            localField: '_id',
            foreignField: 'Article_id',
            as: 'states'
          }
        }, {
          $lookup: {
            from: 'articles',
            localField: 'Article_id',
            foreignField: '_id',
            as: 'articleRefer'
          }
        }, {
          $project: {
            title: 1,
            timeUpload: 1,
            content: 1,
            hashtag: 1,
            isShared: 1,
            Is_Censored: 1,
            userUpload: '$user',
            files: '$file',
            comment: {
              $map: {
                input: '$comments',
                as: 'comment',
                in: {
                  _id: '$$comment._id',
                  comment: '$$comment.comment',
                  timeComment: '$$comment.timeComment',
                  Article_id: '$$comment.Article_id',
                  usercomment: {
                    $arrayElemAt: [
                      {
                        $map: {
                          input: {
                            $filter: {
                              input: "$commentUsers",
                              as: "u",
                              cond: { $eq: ["$$u._id", "$$comment.Account_id"] }
                            }
                          },
                          as: "u",
                          in: {
                            _id: "$$u._id",
                            name: "$$u.name",
                            avatar: "$$u.avatar"
                          }
                        }
                      },
                      0
                    ]
                  },
                  files: {
                    $arrayElemAt: [
                      {
                        $map: {
                          input: {
                            $filter: {
                              input: "$files",
                              as: "f",
                              cond: { $eq: ["$$f.ArticleComment_id", "$$comment._id"] }
                            }
                          },
                          as: "f",
                          in: {
                            _id: "$$f._id",
                            files: "$$f.files"
                          }
                        }
                      },
                      0
                    ]
                  },
                }
              }
            },
            states: '$states'
          }
        }, { $sort: { timeUpload: -1 } },
        { $limit: count },
      ])
    } catch (error) {
      console.log(error)
      return this.value.Fail()
    }
  }
  public getListArticleForUser = async (_id: string): Promise<IArticle[] | boolean> => {
    try {
      return await this.articleModel.aggregate([
        {
          $match: { userId: new Types.ObjectId(_id) }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        }, {
          $lookup: {
            from: 'files',
            localField: '_id',
            foreignField: 'Article_id',
            as: 'file'
          }
        }, {
          $lookup: {
            from: 'articlecomments',
            localField: '_id',
            foreignField: 'Article_id',
            as: 'comments'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'comments.Account_id',
            foreignField: '_id',
            as: 'commentUsers'
          }
        }, {
          $lookup: {
            from: 'files',
            localField: 'comments._id',
            foreignField: 'ArticleComment_id',
            as: 'files'
          }
        }, {
          $lookup: {
            from: 'articlestates',
            localField: '_id',
            foreignField: 'Article_id',
            as: 'states'
          }
        }, {
          $lookup: {
            from: 'articles',
            localField: 'Article_id',
            foreignField: '_id',
            as: 'articleRefer'
          }
        }, {
          $project: {
            title: 1,
            timeUpload: 1,
            content: 1,
            hashtag: 1,
            isShared: 1,
            Is_Censored: 1,
            userUpload: '$user',
            files: '$file',
            comment: {
              $map: {
                input: '$comments',
                as: 'comment',
                in: {
                  _id: '$$comment._id',
                  comment: '$$comment.comment',
                  timeComment: '$$comment.timeComment',
                  Article_id: '$$comment.Article_id',
                  usercomment: {
                    $arrayElemAt: [
                      {
                        $map: {
                          input: {
                            $filter: {
                              input: "$commentUsers",
                              as: "u",
                              cond: { $eq: ["$$u._id", "$$comment.Account_id"] }
                            }
                          },
                          as: "u",
                          in: {
                            _id: "$$u._id",
                            name: "$$u.name",
                            avatar: "$$u.avatar"
                          }
                        }
                      },
                      0
                    ]
                  },
                  files: {
                    $arrayElemAt: [
                      {
                        $map: {
                          input: {
                            $filter: {
                              input: "$files",
                              as: "f",
                              cond: { $eq: ["$$f.ArticleComment_id", "$$comment._id"] }
                            }
                          },
                          as: "f",
                          in: {
                            _id: "$$f._id",
                            files: "$$f.files"
                          }
                        }
                      },
                      0
                    ]
                  },
                }
              }
            },
            states: '$states'
          }
        }
      ])
    } catch (error) {
      console.log(error)
      return this.value.Fail()
    }
  }
  public getListArticleForHashtag = async (hashtag: string): Promise<IArticle[] | boolean> => {
    try {
      return await this.articleModel.aggregate([
        {
          $match: { hashtag: { $regex: new RegExp(`${hashtag}(\\b|$)`, 'i') } }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        }, {
          $lookup: {
            from: 'files',
            localField: '_id',
            foreignField: 'Article_id',
            as: 'file'
          }
        }, {
          $lookup: {
            from: 'articlecomments',
            localField: '_id',
            foreignField: 'Article_id',
            as: 'comments'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'comments.Account_id',
            foreignField: '_id',
            as: 'commentUsers'
          }
        }, {
          $lookup: {
            from: 'files',
            localField: 'comments._id',
            foreignField: 'ArticleComment_id',
            as: 'files'
          }
        }, {
          $lookup: {
            from: 'articlestates',
            localField: '_id',
            foreignField: 'Article_id',
            as: 'states'
          }
        }, {
          $lookup: {
            from: 'articles',
            localField: 'Article_id',
            foreignField: '_id',
            as: 'articleRefer'
          }
        }, {
          $project: {
            title: 1,
            timeUpload: 1,
            content: 1,
            hashtag: 1,
            isShared: 1,
            Is_Censored: 1,
            userUpload: '$user',
            files: '$file',
            comment: {
              $map: {
                input: '$comments',
                as: 'comment',
                in: {
                  _id: '$$comment._id',
                  comment: '$$comment.comment',
                  timeComment: '$$comment.timeComment',
                  Article_id: '$$comment.Article_id',
                  usercomment: {
                    $arrayElemAt: [
                      {
                        $map: {
                          input: {
                            $filter: {
                              input: "$commentUsers",
                              as: "u",
                              cond: { $eq: ["$$u._id", "$$comment.Account_id"] }
                            }
                          },
                          as: "u",
                          in: {
                            _id: "$$u._id",
                            name: "$$u.name",
                            avatar: "$$u.avatar"
                          }
                        }
                      },
                      0
                    ]
                  },
                  files: {
                    $arrayElemAt: [
                      {
                        $map: {
                          input: {
                            $filter: {
                              input: "$files",
                              as: "f",
                              cond: { $eq: ["$$f.ArticleComment_id", "$$comment._id"] }
                            }
                          },
                          as: "f",
                          in: {
                            _id: "$$f._id",
                            files: "$$f.files"
                          }
                        }
                      },
                      0
                    ]
                  },
                }
              }
            },
            states: '$states'
          }
        }
      ])
    } catch (error) {
      console.log(error)
      return this.value.Fail()
    }
  }
  public deleteArticleById = async (_id: string): Promise<boolean> => {
    try {
      await this.articleModel.deleteMany({ Article_id: { $exists: true, $eq: new Types.ObjectId(_id) } }, { Article_id: null }) // delete at shared article
      if (await this.articleModel.deleteOne({ _id: _id })) { await this.updateData(); return this.value.Success() }
      else return this.value.Fail()
    } catch (error) {
      console.log(error)
      return this.value.Fail()
    }
  }
  public updateIsCensored = async (_id: string, Is_Censored: boolean): Promise<boolean> => {
    try {
      const article: IArticle | null = await this.articleModel.findByIdAndUpdate(_id, { Is_Censored: Is_Censored }, { returnDocument: 'after' })
      if (!article) return this.value.Fail()
      else {
        this.updateAtId(article)
        return this.value.Success()
      }
    } catch (error) {
      console.log(error)
      return this.value.Fail()
    }
  }
}