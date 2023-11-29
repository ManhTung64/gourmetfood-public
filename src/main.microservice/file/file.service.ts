import { Injectable } from '@nestjs/common';
import { FileRepository } from './file.repository';
import { ArticleService } from '../article/article.service';
import { UploadFile, file, File } from './dto/file.dto';
import { ConstValue } from '../../otherModule/shared/defaultValues';
import S3 from '../../otherModule/shared/s3.service';
import { ArticleRepository } from '../article/article.repository';
import { StepBeforeUpload } from '../recipe/dto/recipe.dto';
import { ArticleCommentRepository } from '../comment/articleComment/articleComment.repository';
import { RecipeRepository } from '../recipe/recipe.repository';
import { IFile, Ifile } from './file.model';

@Injectable()
export class FileService {
    constructor(private readonly repository: FileRepository,
        private readonly articleRepository: ArticleRepository,
        private readonly value: ConstValue,
        private readonly s3: S3,
        private readonly articleCommentRepository: ArticleCommentRepository,
        private readonly recipeRepository: RecipeRepository
    ) {
    }
    public createFileStoreForArticle = async (article_id: string, files: Array<UploadFile>): Promise<boolean> => {
        try {
            if ((!article_id && !files) || files.length < 1) throw new Error("Missing information")
            else if (!this.articleRepository.findById(article_id)) return this.value.NotFound()
            const finalFiles: Array<file> | null = await this.uploadFileWithoutStep(files)
            const articleFile: File = { Article_id: article_id }
            if (finalFiles && await this.repository.addNewFile(articleFile, finalFiles)) return this.value.Success()
            else return this.value.Fail()
        } catch (error) {
            console.log(error)
            return this.value.Fail()
        }
    }
    public createFileStoreForArticleComment = async (comment_id: string, files: Array<UploadFile>): Promise<boolean> => {
        try {
            if ((!comment_id && !files) || files.length < 1) throw new Error("Missing information")
            else if (!this.articleCommentRepository.findById(comment_id)) return this.value.NotFound()
            const finalFiles: Array<file> | null = await this.uploadFileWithoutStep(files)
            const articleCommentFile: File = { ArticleComment_id: comment_id }
            if (finalFiles && await this.repository.addNewFile(articleCommentFile, finalFiles)) return this.value.Success()
            else return this.value.Fail()
        } catch (error) {
            console.log(error)
            return this.value.Fail()
        }
    }
    public deleteFileOfArticle = async (article_id: string): Promise<boolean> => {
        try {
            if (!article_id) throw new Error("Missing information")
            if (await this.repository.deleteWithArticleId(article_id)) return this.value.Success()
            else return this.value.Fail()
        } catch (error) {
            console.log(error)
            return this.value.Fail()
        }
    }
    public deleteFileOfRecipe = async (recipe_id: string): Promise<boolean> => {
        try {
            if (!recipe_id) throw new Error("Missing information")
            if (await this.repository.deleteWithRecipeId(recipe_id)) return this.value.Success()
            else return this.value.Fail()
        } catch (error) {
            console.log(error)
            return this.value.Fail()
        }
    }
    public createFileStoreForRecipe = async (recipe_id: string, files: Array<UploadFile>, urls: Array<string>, steps: Array<StepBeforeUpload>): Promise<boolean> => {
        try {
            if ((!recipe_id && !files) || files.length < 1 || !urls || !steps) throw new Error("Missing information")
            const finalFiles: Array<file> | null = await this.formatFileWithStep(urls, files, steps)
            const recipeFile: File = { Recipe_id: recipe_id }
            if (finalFiles && await this.repository.addNewFile(recipeFile, finalFiles)) return this.value.Success()
            else return this.value.Fail()
        } catch (error) {
            console.log(error)
            return this.value.Fail()
        }
    }
    public uploadFileWithoutStep = async (files: Array<UploadFile>): Promise<Array<file> | null> => {
        try {
            // upload to s3 and get url
            const urls: Array<string> | string = (files.length > 1) ? await this.s3.UploadManyFiles(files) : await this.s3.UploadOneFile(files[0])
            // create to array file (url and type of file (img, video))
            return this.formatFileWithoutStep(urls, files)
        } catch (error) {
            console.log(error)
            return null
        }
    }
    private formatFileWithoutStep = async (urls: Array<string> | string, files: Array<UploadFile>): Promise<Array<file> | null> => {
        try {
            let finalFiles: Array<file> = []
            let file: file = { url: "", isImage: true }
            if (typeof urls === "string") {  // one file
                file.url = urls
                if (files[0].mimetype.startsWith('video/')) file.isImage = false
                finalFiles.push(file)
            } else {                         //many files
                for (let i = 0; i < files.length; i++) {
                    if (files[i].mimetype.startsWith('video/')) file.isImage = false
                    file.url = urls[i]
                    finalFiles.push(file)
                    file = { url: "", isImage: true }
                }
            }
            return finalFiles
        } catch (error) {
            console.log(error)
            return null
        }
    }
    private formatFileWithStep = async (urls: Array<string>, files: Array<UploadFile>, steps: Array<StepBeforeUpload>): Promise<Array<file> | null> => {
        try {
            let finalFiles: Array<file> = []
            let file: file = { url: "", isImage: true, step: 1 }
            // loop files (1-end)
            for (let i = 1; i < files.length; i++) {
                // loop step
                for (let step = 0; step < steps.length || i < files.length; step++) {
                    //check isHas file and quantity of file each step
                    let end: boolean = false // end each step
                    if (!end && ((steps[step].files && steps[step].resources >= 1) || i < files.length)) { // condition check null and end var
                        for (let fileNo = 0; !end && (fileNo < steps[step].resources); fileNo++) {
                            // loop each file in list file of each step
                            if (files[i].mimetype.startsWith('video/')) file.isImage = false
                            file.step = steps[step].no
                            file.url = urls[i]
                            finalFiles.push(file)
                            file = { url: "", isImage: true, step: 0 }
                            if (fileNo == steps[step].resources - 1) end = true //condition end list file of each step
                            i += 1
                        }
                    }
                }
            }
            return finalFiles
        } catch (error) {
            console.log(error)
            return null
        }
    }
    public findDataByArticleId = (article_id: string): IFile => {
        try {
            return this.repository.findByArticleId(article_id)
        } catch (error) {
            console.log(error)
            return null
        }
    }
    public compareAndChangeFile = async (_id: string, oldFile: [string], isArticle: boolean, isComment: boolean): Promise<boolean> => {
        try {
            if (isArticle && !isComment) var files: IFile = this.repository.findByArticleId(_id)
            if (oldFile.length < 1){
                await this.repository.deleteWithArticleId(_id)
                return this.value.Success()
            } 
            var indexRemove: number[] = this.findRemoveIndex(oldFile, files)
            if (indexRemove.length > 0) {
                //remove at index
                var fileUpdate: Ifile[] = []
                for (let i = 0; i <files.files.length;i++){
                    const removeData:number = indexRemove.find(index=>{return index == i})
                   if (!removeData) fileUpdate.push(files.files[i])
                }
            }
            //update file
            if (await this.repository.updateFiles(fileUpdate,files._id.toString())) return this.value.Success()
            else return this.value.Fail()
        } catch (error) {
            console.log(error)
            return this.value.Fail()
        }
    }
    public updateFile = async (_id:string,filesUpload:Array<UploadFile>,listIndex:[number], isArticle: boolean, isComment: boolean)=>{
        try{
            //get old file
            if (isArticle && !isComment) var files: IFile = this.repository.findByArticleId(_id)
            if (!files) return await this.createFileStoreForArticle(_id,filesUpload)
            //upload new file
            const filesUploaded: Array<file> = await this.uploadFileWithoutStep(filesUpload)
            //convert old file to class file
            let convertFiles:Array<file> = this.convertIfileTofile(files.files)
            // insert new file to array contains old file
            for (let i = 0; i< listIndex.length; i++){
                convertFiles.splice(listIndex[i],0,filesUploaded[i])
            }
            if (await this.repository.updateFiles(convertFiles,files._id.toString())) return this.value.Success()
            else return this.value.Fail()
        }catch (error) {
            console.log(error)
            return this.value.Fail()
        }
    }
    private convertIfileTofile = (files:Ifile[]):Array<file>=>{
        try{
            let convertFile:file[] = []
            files.map((element)=>{
                const cFile:file = {url:element.url,isImage:element.isImage}
                convertFile.push(cFile)
            })
            return convertFile
        }catch (error) {
            console.log(error)
            return null
        }
    }
    private findRemoveIndex = (files: [string], databaseFiles: IFile): number[] => {
        try {
            var indexRemoveFile: number[] = []
            for (let i = 0; i < databaseFiles.files.length; i++) {
                if (typeof files !== 'object') var hasFile:string = (files == databaseFiles.files[i].url ) ? databaseFiles.files[i].url : undefined
                else var hasFile: string = files.find(oldFile => { return oldFile == databaseFiles.files[i].url })
                if (!hasFile) indexRemoveFile.push(i)
            }
            return indexRemoveFile
        } catch (error) {
            console.log(error)
            return null
        }
    }
}
