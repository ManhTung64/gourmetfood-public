import { Schema } from "mongoose";

interface IRatingRecipe extends Document{
    _id?:Schema.Types.ObjectId,
    Account_id:Schema.Types.ObjectId,
    Recipe_id:Schema.Types.ObjectId,
    MealPlan_id:Schema.Types.ObjectId,
    rating:number,
    Category:Schema.Types.ObjectId
}
const ratingSchema:Schema<IRatingRecipe> = new Schema<IRatingRecipe>({
    Account_id: {type:Schema.Types.ObjectId, ref: 'User', required:true},
    Recipe_id: {type:Schema.Types.ObjectId, ref: 'Recipe'},
    MealPlan_id: {type:Schema.Types.ObjectId, ref: 'MealPlan'},
    Category: {type:String, ref: 'Category',select:'name' , required:true},
    rating: {type: Number, required:true, minlength:1, maxlength: 5}
})
export {ratingSchema, IRatingRecipe}