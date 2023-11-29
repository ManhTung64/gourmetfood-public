import { Schema } from "mongoose";

interface IRecipeComment extends Document{
    _id?:Schema.Types.ObjectId,
    Account_id:Schema.Types.ObjectId,
    comment:string,
    Recipe_id:Schema.Types.ObjectId,
    timeComment:Date,
    Is_Censored:boolean
}
const recipeCommentSchema:Schema<IRecipeComment> = new Schema<IRecipeComment>({
    Account_id: {type: Schema.Types.ObjectId, required:true, ref:'User'},
    comment: {type:String, required:true},
    timeComment: {type: Date, default: new Date(), required: true},
    Recipe_id: {type:Schema.Types.ObjectId, required:true, ref:'Article'},
    Is_Censored:{type: Boolean, default: false}
})
export {IRecipeComment, recipeCommentSchema}
