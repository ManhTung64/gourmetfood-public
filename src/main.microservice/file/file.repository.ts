import { Repository } from "../../../base/base.repository"
import { IFile, Ifile } from "./file.model"
import { Model } from "mongoose"
import { File, file } from "./dto/file.dto"
import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"

@Injectable()
export class FileRepository extends Repository<IFile>{
  constructor(@InjectModel('File') private readonly fileModel: Model<IFile>) {
    super(fileModel)
  }
  public addNewFile = async (file: File, files: Array<file> | file): Promise<boolean> => {
    try {
      const newfile: IFile = await new this.fileModel({
        Article_id: file.Article_id,
        Recipe_id: file.Recipe_id,
        ArticleComment_id: file.ArticleComment_id,
        RecipeComment_id: file.RecipeComment_id,
        files: files
      }).save()
      if (newfile) {
        this.data.push(newfile)
        return this.value.Success()
      } else return this.value.Fail()
    } catch (error) {
      console.log(error)
      return this.value.Fail()
    }
  }
  public updateFiles = async (files:[Ifile] |Array<file>,_id:string):Promise<boolean>=>{
    try{
      const update:IFile = await this.fileModel.findByIdAndUpdate(_id,{
        files:files
      },{returnDocument:'after'})
      if (update) this.updateAtId(update)
      return this.value.Success()
    }catch (error) {
      console.log(error)
      return this.value.Fail()
    }
  }
  public deleteWithArticleId = async (article_id: string): Promise<boolean> => {
    try {
      const file: IFile = await this.fileModel.findOneAndDelete({ Article_id: article_id })
      if (file) {
        this.updateAtId(file, true)

      } return this.value.Success()
    } catch (error) {
      console.log(error)
      return this.value.Fail()
    }
  }
  public deleteWithRecipeId = async (recipe_id: string): Promise<boolean> => {
    try {
      const file: IFile = await this.fileModel.findOneAndDelete({ Recipe_id: recipe_id })
      if (file) {
        this.updateAtId(file, true)

      } return this.value.Success()
    } catch (error) {
      console.log(error)
      return this.value.Fail()
    }
  }
  public findAndDeleteAtArticleComment_id = async (_id: string): Promise<IFile | null | boolean> => {
    try {

      const file: IFile = await this.fileModel.findOneAndDelete({ ArticleComment_id: _id })
      if (file) this.updateAtId(file, true)
      return file
    } catch (error) {
      console.log(error)
      return this.value.Fail()
    }
  }
  public findAndDeleteAtRecipeComment_id = async (_id: string): Promise<IFile | null | boolean> => {
    try {
      const file: IFile = await this.fileModel.findOneAndDelete({ RecipeComment_id: _id })
      if (file) this.updateAtId(file, true)
      return file
    } catch (error) {
      console.log(error)
      return this.value.Fail()
    }
  }
  public findByArticleId = (article_id: string): IFile => {
    try {
      const file: IFile = this.data.find(data => { return data.Article_id && data.Article_id.toString() == article_id })
      return file
    } catch (error) {
      console.log(error)
      return null
    }
  }
}
