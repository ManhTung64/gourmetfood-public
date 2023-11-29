import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from 'mongoose'
import { Repository } from "../../../base/base.repository";
import { UpdateUser } from "./user.interface";
import { BaseUser, Role } from "./dto/user.dto";
import { IUser } from "./user.model";
import { RedisService } from "../../otherModule/redis/redis.service";

@Injectable()
export class UserRepository extends Repository<IUser>{
  constructor(@InjectModel('User') private readonly userModel: Model<IUser>, private readonly redis: RedisService) {
    super(userModel,redis,'users')
  }
  public findAccountBaseUsernameAndEmail = (username: string, email: string): boolean => {
    try {
      var account: IUser = this.data.find(data => { return data.username == username || data.email == email })
      if (!account) return false
      else return true
    } catch (error) {
      console.log(error)
      return false
    }
  }
  public findAccountBaseUsername = (username: string): IUser | null => {
    try {
      const account: IUser[] = this.data.filter(data => { return data.username == username })
      if (account.length != 1) throw Error()
      else return account[0]
    } catch (error) {
      console.log(error)
      return null
    }
  }
  public findAccountBaseEmail = (email: string): IUser | null => {
    try {
      const account: IUser = this.data.find(data => { return data.email == email })
      if (!account) return null
      else return account
    } catch (error) {
      console.log(error)
      return null
    }
  }
  public changePasswordAtId = async (password: string, _id: string): Promise<boolean> => {
    try {
      const user: IUser = await this.userModel.findByIdAndUpdate(_id, { password: password }, { returnDocument: 'after' })
      if (user) {
        this.updateAtId(user)
        return true
      }
      else return false
    } catch (error) {
      console.log(error)
      return false
    }
  }
  public changePasswordAtUsername = async (password: string, username: string): Promise<boolean> => {
    try {
      const user: IUser = await this.userModel.findOneAndUpdate({ username: username }, { password: password }, { returnDocument: 'after' })
      if (user) {
        this.updateAtId(user)
        return true
      }
      else return false
    } catch (error) {
      console.log(error)
      return false
    }
  }
  public updateProfileById = async (update: UpdateUser): Promise<IUser | null> => {
    try {
      const user: IUser = await this.userModel.findOneAndUpdate({ _id: new Types.ObjectId(update._id) },
        {
          name: update.name,
          gender: update.gender,
          dob: update.dob,
          address: update.address,
          country: update.country,
          avatar: update.avatar
        }, { returnDocument: 'after' })
      if (user) {
        this.updateAtId(user)
        return user
      }
      else return null
    } catch (error) {
      console.log(error)
      return null
    }
  }
  public getAllUsers = async (): Promise<Array<BaseUser> | null> => {
    try {
      const listUsers: Array<BaseUser> | null = await this.userModel.aggregate([
        {
          $lookup: {
            from: 'roles',
            localField: 'role',
            foreignField: '_id',
            as: 'role'
          }
        },
        {
          $match: { 'role.0.role': { $ne: Role.Admin } }
        },
        {
          $project: {
            _id: 1,
            username: 1,
            email: 1,
            name: 1,
            active: 1,
            avatar:1,
            role: '$role.role'
          }
        }
      ])
      return listUsers
    } catch (error) {
      console.log(error)
      return null
    }
  }
  public getUserByMonth = async (): Promise<unknown> => {
    try {
      return await this.userModel.aggregate([
        {
          $match: { role: new Types.ObjectId('653b77c56139d7a2604cedb9') }
        },
        {
          $group: {
            _id: { $month: "$createAt" },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            month: "$_id",
            count: 1,
            _id: 0
          }
        }
      ])
    } catch (error) {
      console.log(error)
      return null
    }
  }
  public getSponsorByMonth = async (): Promise<unknown> => {
    try {
      await this.userModel.updateMany({},{verify:true,active:true})
      return await this.userModel.aggregate([
        {
          $match: { role: new Types.ObjectId('653b77c46139d7a2604cedb7') }
        },
        {
          $group: {
            _id: { $month: "$createAt" },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            month: "$_id",
            count: 1,
            _id: 0
          }
        }
      ])
    } catch (error) {
      console.log(error)
      return null
    }
  }
  public changeStateAccountById = async (_id: string, active: boolean): Promise<boolean> => {
    try {
      const user: IUser = await this.userModel.findByIdAndUpdate(_id, { active: active }, { returnDocument: 'after' })
      if (user) {
        this.updateAtId(user)
        return true
      }
      else return false
    } catch (error) {
      console.log(error)
      return false
    }
  }
  public verifyAccount = async (_id: string): Promise<boolean> => {
    try {
      const user: IUser = await this.userModel.findByIdAndUpdate(_id, { verify: true }, { returnDocument: 'after' })
      if (user) {
        this.updateAtId(user)
        return true
      }
      else return false
    } catch (error) {
      console.log(error)
      return false
    }
  }
  public changeStateAccountByEmail = async (email: string, active: boolean): Promise<boolean> => {
    try {
      const user: IUser = await this.userModel.findOneAndUpdate({ email: email }, { active: active }, { returnDocument: 'after' })
      if (user) {
        this.updateAtId(user)
        return true
      }
      else return false
    } catch (error) {
      console.log(error)
      return false
    }
  }
  public changeEmail = async (_id: string, email: string): Promise<boolean> => {
    try {
      const user: IUser = await this.userModel.findByIdAndUpdate(_id, { email: email }, { returnDocument: 'after' })
      if (user) {
        this.updateAtId(user)
        return true
      }
      else return false
    } catch (error) {
      console.log(error)
      return false
    }
  }
  public deleteUserByEmail = async (email: string): Promise<boolean> => {
    try {
      const user: IUser = await this.userModel.findOneAndDelete({ email: email })
      if (user) {
        this.updateAtId(user, true)
        return true
      }
      return false
    } catch (error) {
      console.log(error)
      return false
    }
  }
  public getUserWithArticleAndRecipeAndPlanMealQuantity = async (): Promise<unknown> => {
    try {
      return await this.userModel.aggregate([
        {
          $match: {
            role: new Types.ObjectId("653b77c56139d7a2604cedb9")// role userId because it not change
          }
        }, {
          $lookup: {
            from: 'articles',
            localField: '_id',
            foreignField: 'userId',
            as: 'articles'
          }
        }, {
          $lookup: {
            from: 'recipes',
            localField: '_id',
            foreignField: 'User_id',
            as: 'recipes'
          }
        }, {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            dob: 1,
            gender: 1,
            articles: { $size: "$articles" },
            recipes: { $size: "$recipes" }

          }
        }
      ])
    } catch (error) {
      console.log(error)
      return null
    }
  }
  public getSponsorWithPackage = async (): Promise<IUser[]> => {
    try {
      return await this.userModel.aggregate([
        {
          $match: {
            role: new Types.ObjectId(Role.Sponsor)
          }
        }, {
          $lookup: {
            from: 'userpackages',
            localField: '_id',
            foreignField: 'Account_id',
            as: 'userpackages'
          }
        }, {
          $lookup: {
            from: 'invoices',
            localField: 'userpackages.Invoice_id',
            foreignField: '_id',
            as: 'invoices'
          }
        }, {
          $lookup: {
            from: 'adspackages',
            localField: 'userpackages.AdsPackage_id',
            foreignField: '_id',
            as: 'package'
          }
        }, {
          $project: {
            _id: 1,
            createAt: 1,
            name:1,
            packages: {
              $map: {
                input: '$userpackages',
                as: 'userpk',
                in: {
                  from: '$$userpk.from',
                  to: '$$userpk.to',
                  cost: {
                    $arrayElemAt: [
                      {
                        $map: {
                          input: {
                            $filter: {
                              input: '$invoices',
                              as: 'invoice',
                              cond: { $eq: ['$$userpk.Invoice_id', '$$invoice._id'] }
                            }
                          },
                          as: "in",
                          in: {
                            payment: "$$in.amount"
                          }
                        }
                    },0
                    ]
                  },
                  package: {
                    $arrayElemAt: [
                      {
                        $map: {
                          input: {
                            $filter: {
                              input: '$package',
                              as: 'package',
                              cond: { $eq: ['$$userpk.AdsPackage_id', '$$package._id'] }
                            }
                          },
                          as: "pk",
                          in: {
                            name: "$$pk.name"
                          }
                        }
                    },0
                    ]
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
}