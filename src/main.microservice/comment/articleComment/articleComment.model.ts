import { Schema } from "mongoose";

interface IArticleComment extends Document{
    _id?:Schema.Types.ObjectId,
    Account_id:Schema.Types.ObjectId,
    comment:string,
    Article_id:Schema.Types.ObjectId,
    timeComment:Date,
    Is_Censored:boolean
}
const articleCommentSchema:Schema<IArticleComment> = new Schema<IArticleComment>({
    Account_id: {type: Schema.Types.ObjectId, required:true, ref:'User'},
    comment: {type:String, required:true},
    timeComment: {type: Date, default: new Date(), required: true},
    Article_id: {type:Schema.Types.ObjectId, required:true, ref:'Article'},
    Is_Censored:{type: Boolean, default: false}
})
export {IArticleComment, articleCommentSchema}
