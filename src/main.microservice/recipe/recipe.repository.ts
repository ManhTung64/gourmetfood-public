import { Repository } from "../../../base/base.repository"
import { IRecipe } from "./recipe.model"
import { Model, Types } from "mongoose"
import { UpdateRecipe } from "./dto/recipe.dto"
import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { RedisService } from "../../otherModule/redis/redis.service"

@Injectable()
export class RecipeRepository extends Repository<IRecipe>{
  constructor(@InjectModel('Recipe') private readonly recipeModel: Model<IRecipe>, private readonly rService: RedisService) {
    super(recipeModel)
    new Promise(() => this.setToRedis())
  }
  private setToRedis = async (): Promise<boolean> => {
    try {
      var recipeWithFiles = await this.findAll()
      var success = await this.rService.setValue('recipe', JSON.stringify(recipeWithFiles))
      if (success) return this.value.Success()
    } catch (error) {
      console.log(error)
      return this.value.Fail()
    }
  }
  public updateById = async (recipe: UpdateRecipe): Promise<IRecipe | null> => {
    try {
      const recipeU: IRecipe = await this.recipeModel.findByIdAndUpdate(recipe._id, {
        name: recipe.name,
        description: recipe.description,
        Category: recipe.Category,
        User_id: recipe.User_id,
        timeUpload: new Date(),
        timeCook: recipe.timeCook,
        timePrepare: recipe.timePrepare,
        ingredients: recipe.ingredients,
        steps: recipe.ingredients,
        nPerson: recipe.nPerson,
        image: recipe.image,
        prepare: recipe.prepare,
        Is_Censored: false
      }, { returnDocument: 'after' })
      if (recipeU) this.updateAtId(recipeU)
      return recipeU
    } catch (error) {
      console.log(error)
      return null
    }
  }
  public updateIsCensored = async (_id: string, Is_Censored: boolean): Promise<boolean> => {
    try {
      const recipe: IRecipe | null = await this.recipeModel.findByIdAndUpdate(_id, { Is_Censored: Is_Censored }, { returnDocument: 'after' })
      if (!recipe) return this.value.Fail()
      else {
        this.updateAtId(recipe)
        return this.value.Success()
      }
    } catch (error) {
      console.log(error)
      return this.value.Fail()
    }
  }
  public findAll = async (): Promise<IRecipe[]> => {
    try {
      return await this.recipeModel.aggregate([
        {
          $lookup: {
            from: 'files',
            localField: '_id',
            foreignField: 'Recipe_id',
            as: 'files'
          }
        },
        {
          $lookup: {
            from: 'ratingrecipes',
            localField: '_id',
            foreignField: 'Recipe_id',
            as: 'ratings'
          }
        },
        {
          $lookup: {
            from: 'recipecomments',
            localField: '_id',
            foreignField: 'Recipe_id',
            as: 'comments'
          }
        },{
          $lookup: {
            from: 'saverecipes',
            localField: '_id',
            foreignField: 'Recipe_id',
            as: 'collections'
          }
        },
        {
          $project: {
            name: 1,
            ratings:{$size:'$ratings'},
            comments:{$size:'$comments'},
            collections:{$size:'$collections'},
            avgRating:{$avg:'$ratings.rating'},
            description: 1,
            nutrion: 1,
            ingredients: 1,
            timeCook: 1,
            timePrepare: 1,
            type: 1,
            nPerson: 1,
            timeUpload: 1,
            image: 1,
            Category: 1,
            User_id: 1,
            Is_Censored: 1,
            _id: 1,
            steps: {
              $map: {
                input: '$steps',
                as: 'step',
                in: {
                  no: '$$step.no',
                  detail: '$$step.detail',
                  files: {
                    $map: {
                      input: '$files',
                      as: 'file',
                      in: {
                        fileStep: {
                          $filter: {
                            input: '$$file.files',
                            as: 'fstep',
                            cond: { $eq: ['$$fstep.step', '$$step.no'] }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },{
          $sort:{timeUpload:-1}
        }
      ])

    } catch (error) {
      console.log(error)
      return null
    }
  }
  public findSimpleDataByCategory = (category: string): IRecipe[] => {
    try {
      return this.data.filter((data) => { return data.Category == category })
    } catch (error) {
      console.log(error)
      return null
    }
  }
  public findRecipeWithAuthor = async (): Promise<IRecipe[]> => {
    try {
      return await this.recipeModel.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'User_id',
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
  public findByCategory = async (categoryName: string): Promise<IRecipe[]> => {
    try {
      return await this.recipeModel.aggregate([
        {
          $match: {
            Category: categoryName
          }
        },
        {
          $lookup: {
            from: 'files',
            localField: '_id',
            foreignField: 'Recipe_id',
            as: 'files'
          }
        },
        {
          $lookup: {
            from: 'ratingrecipes',
            localField: '_id',
            foreignField: 'Recipe_id',
            as: 'ratings'
          }
        },
        {
          $project: {
            name: 1,
            description: 1,
            ratings:{$size:'$ratings'},
            nutrion: 1,
            ingredients: 1,
            timeCook: 1,
            timePrepare: 1,
            nPerson: 1,
            type: 1,
            timeUpload: 1,
            image: 1,
            Category: 1,
            User_id: 1,
            Is_Censored: 1,
            _id: 1,
            steps: {
              $map: {
                input: '$steps',
                as: 'step',
                in: {
                  no: '$$step.no',
                  detail: '$$step.detail',
                  files: {
                    $map: {
                      input: '$files',
                      as: 'file',
                      in: {
                        fileStep: {
                          $filter: {
                            input: '$$file.files',
                            as: 'fstep',
                            cond: { $eq: ['$$fstep.step', '$$step.no'] }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },{
          $sort:{ratings:-1}
        }
      ])

    } catch (error) {
      console.log(error)
      return null
    }
  }
  public findAllRecipeWithRating = async (): Promise<IRecipe[]> => {
    try {
      return await this.recipeModel.aggregate([
        {
          $lookup: {
            from: 'ratingrecipes',
            localField: '_id',
            foreignField: 'Recipe_id',
            as: 'ratings'
          }
        }, {
          $lookup: {
            from: 'users',
            localField: 'User_id',
            foreignField: '_id',
            as: 'user'
          }
        }, {
          $addFields: {
            ratings: '$ratings',
            user: '$user'
          }
        }
      ])
    } catch (error) {
      console.log(error)
      return null
    }
  }
  public findRecipe = async (_id: string): Promise<unknown> => {
    try {
      return await this.recipeModel.aggregate([
        {
          $match: { _id: new Types.ObjectId(_id) }
        },
        {
          $lookup: {
            from: 'files',
            localField: '_id',
            foreignField: 'Recipe_id',
            as: 'files'
          }
        }, {
          $lookup: {
            from: 'users',
            localField: 'User_id',
            foreignField: '_id',
            as: 'user'
          }
        }, {
          $lookup: {
            from: 'ratingrecipes',
            localField: '_id',
            foreignField: 'Recipe_id',
            as: 'ratings'
          }
        }, {
          $lookup: {
            from: 'recipecomments',
            localField: '_id',
            foreignField: 'Recipe_id',
            as: 'comments'
          }
        }, {
          $lookup: {
            from: 'users',
            localField: 'comments.Account_id',
            foreignField: '_id',
            as: 'commentUser'
          }
        },
        {
          $project: {
            name: 1,
            description: 1,
            nutrion: 1,
            ingredients: 1,
            timeCook: 1,
            timePrepare: 1,
            nPerson: 1,
            type: 1,
            timeUpload: 1,
            image: 1,
            Category: 1,
            Is_Censored: 1,
            _id: 1,
            user: {
              $map: {
                input: '$user',
                as: 'user',
                in: {
                  _id: '$$user._id',
                  name: '$$user.name',
                  avatar: '$$user.avatar'
                }
              }
            }, ratings: {
              $map: {
                input: '$ratings',
                as: 'rating',
                in: {
                  _id: '$$rating._id',
                  Account_id: '$$rating.Account_id',
                  rating: '$$rating.rating'
                }
              }
            }, comments: {
              $map: {
                input: '$comments',
                as: 'comment',
                in: {
                  _id: '$$comment._id',
                  comment: '$$comment.comment',
                  timeComment: '$$comment.timeComment',
                  userComment: {
                    $arrayElemAt: [{
                      $map: {
                        input: {
                          $filter: {
                            input: '$commentUser',
                            as: 'user',
                            cond: { $eq: ['$$user._id', '$$comment.Account_id'] }
                          }
                        },
                        as: 'u',
                        in: {
                          _id: '$$u._id',
                          name: '$$u.name',
                          avatar: '$$u.avatar'
                        }
                      }
                    }, 0]
                  }
                }
              }
            },
            steps: {
              $map: {
                input: '$steps',
                as: 'step',
                in: {
                  no: '$$step.no',
                  detail: '$$step.detail',
                  files: {
                    $map: {
                      input: '$files',
                      as: 'file',
                      in: {
                        fileStep: {
                          $filter: {
                            input: '$$file.files',
                            as: 'fstep',
                            cond: { $eq: ['$$fstep.step', '$$step.no'] }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      ])
    } catch (error) {
      console.log(error)
      return null
    }
  }
  public findRecipeByUser = async (_id: string): Promise<IRecipe[]> => {
    try {
      return await this.recipeModel.aggregate([
        {
          $match: { User_id: new Types.ObjectId(_id) }
        },
        {
          $lookup: {
            from: 'files',
            localField: '_id',
            foreignField: 'Recipe_id',
            as: 'files'
          }
        }, {
          $lookup: {
            from: 'users',
            localField: 'User_id',
            foreignField: '_id',
            as: 'user'
          }
        }, {
          $lookup: {
            from: 'ratingrecipes',
            localField: '_id',
            foreignField: 'Recipe_id',
            as: 'ratings'
          }
        }, {
          $lookup: {
            from: 'recipecomments',
            localField: '_id',
            foreignField: 'Recipe_id',
            as: 'comments'
          }
        }, {
          $lookup: {
            from: 'users',
            localField: 'comments.Account_id',
            foreignField: '_id',
            as: 'commentUser'
          }
        },
        {
          $project: {
            name: 1,
            description: 1,
            nutrion: 1,
            ingredients: 1,
            timeCook: 1,
            timePrepare: 1,
            nPerson: 1,
            type: 1,
            timeUpload: 1,
            image: 1,
            Category: 1,
            Is_Censored: 1,
            _id: 1,
            user: {
              $map: {
                input: '$user',
                as: 'user',
                in: {
                  _id: '$$user._id',
                  name: '$$user.name',
                  avatar: '$$user.avatar'
                }
              }
            }, ratings: {
              $map: {
                input: '$ratings',
                as: 'rating',
                in: {
                  _id: '$$rating._id',
                  Account_id: '$$rating.Account_id',
                  rating: '$$rating.rating'
                }
              }
            }, comments: {
              $map: {
                input: '$comments',
                as: 'comment',
                in: {
                  _id: '$$comment._id',
                  comment: '$$comment.comment',
                  timeComment: '$$comment.timeComment',
                  userComment: {
                    $arrayElemAt: [{
                      $map: {
                        input: {
                          $filter: {
                            input: '$commentUser',
                            as: 'user',
                            cond: { $eq: ['$$user._id', '$$comment.Account_id'] }
                          }
                        },
                        as: 'u',
                        in: {
                          _id: '$$u._id',
                          name: '$$u.name',
                          avatar: '$$u.avatar'
                        }
                      }
                    }, 0]
                  }
                }
              }
            },
            steps: {
              $map: {
                input: '$steps',
                as: 'step',
                in: {
                  no: '$$step.no',
                  detail: '$$step.detail',
                  files: {
                    $map: {
                      input: '$files',
                      as: 'file',
                      in: {
                        fileStep: {
                          $filter: {
                            input: '$$file.files',
                            as: 'fstep',
                            cond: { $eq: ['$$fstep.step', '$$step.no'] }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      ])
    } catch (error) {
      console.log(error)
      return null
    }
  }
  public findRecipesEachUser = async (): Promise<IRecipe[]> => {
    try {
      return await this.recipeModel.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'User_id',
            foreignField: '_id',
            as: 'user'
          }
        }, {
          $group: {
            _id: '$User_id',
            recipeCount: { $sum: 1 },
            user: { $first: '$user' }
          },
        },
        {
          $sort: { recipeCount: -1 },
        },
      ])
    } catch (error) {
      console.log(error)
      return null
    }
  }
  public findTopCollectionRecipe = async (): Promise<IRecipe[]> => {
    try {
      return await this.recipeModel.aggregate([
        {
          $lookup: {
            from: 'saverecipes',
            localField: '_id',
            foreignField: 'Recipe_id',
            as: 'collections'
          }
        },{
          $addFields:{
            collections:{$size:'$collections'}
          }
        },
        {
          $sort: { collections: -1 },
        },
      ])
    } catch (error) {
      console.log(error)
      return null
    }
  }
}