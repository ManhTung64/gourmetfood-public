import { Schema } from "mongoose";

interface IReport extends Document{
    _id?:Schema.Types.ObjectId,
    Account_id?:Schema.Types.ObjectId,
    Article_id?:Schema.Types.ObjectId,
    ArticleComment_id?:Schema.Types.ObjectId,
    Recipe_id?:Schema.Types.ObjectId,
    RecipeComment_id?:Schema.Types.ObjectId,
}

const reportSchema:Schema<IReport> = new Schema<IReport>({
    Account_id: {type:Schema.Types.ObjectId, ref:'User'},
    Article_id: {type:Schema.Types.ObjectId, ref:'Article'},
    ArticleComment_id: {type:Schema.Types.ObjectId, ref:'ArticleComment'},
    Recipe_id: {type:Schema.Types.ObjectId, ref:'Recipe'},
    RecipeComment_id: {type:Schema.Types.ObjectId, ref:'RecipeComment'}
})

export {IReport, reportSchema}