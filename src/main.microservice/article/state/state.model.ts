import { Schema, model } from "mongoose"

interface IArticleState extends Document{
    _id?:string
    state:string,
    Account_id:Schema.Types.ObjectId,
    Article_id:Schema.Types.ObjectId
}
const articleStateSchema:Schema<IArticleState> = new Schema<IArticleState>({
    state: {type:String, required:true, enum:['heart']},
    Account_id: {type:Schema.Types.ObjectId, required:true, ref: 'User'},
    Article_id: {type:Schema.Types.ObjectId, required:true, ref: 'Article'},
})
export {articleStateSchema, IArticleState}