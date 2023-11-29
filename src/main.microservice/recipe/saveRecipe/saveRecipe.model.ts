import { Schema } from "mongoose"

interface ISaveRecipe extends Document{
    _id?:Schema.Types.ObjectId,
    Collection_id:Schema.Types.ObjectId,
    Recipe_id:Schema.Types.ObjectId,
    saveDate:Date
}
const saveRecipeSchema:Schema<ISaveRecipe> = new Schema<ISaveRecipe>({
    Collection_id:{type:Schema.Types.ObjectId, ref:'Collection', required:true},
    Recipe_id:{type:Schema.Types.ObjectId, ref:'Recipe', required:true},
    saveDate:{type:Date, default:new Date()}
})

export {ISaveRecipe, saveRecipeSchema}
