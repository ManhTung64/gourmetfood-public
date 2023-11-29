import {Schema} from "mongoose"

interface IFile extends Document{
    _id?:Schema.Types.ObjectId,
    Article_id?: Schema.Types.ObjectId,
    ArticleComment_id?: Schema.Types.ObjectId,
    RecipeComment_id?: Schema.Types.ObjectId,
    Recipe_id?:Schema.Types.ObjectId,
    files?: [Ifile]
}
interface Ifile extends Document{
    url:string,
    isImage:boolean,
    step?:number
}
const fSchema:Schema<Ifile> = new Schema<Ifile>({
    url:{type:String, required:true},
    isImage:{type:Boolean, default: true},
    step:{type:Number}
})
const fileSchema:Schema<IFile> = new Schema<IFile>({
    Article_id : {type: Schema.Types.ObjectId, ref: 'Article'},
    ArticleComment_id : {type: Schema.Types.ObjectId,ref: 'ArticleComment' },
    RecipeComment_id :{type: Schema.Types.ObjectId},
    Recipe_id: {type: Schema.Types.ObjectId, ref: 'Recipe'},
    files: {type: [fSchema], required:true}
})
export {fileSchema, IFile, Ifile}