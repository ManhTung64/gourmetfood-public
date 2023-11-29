import { Schema } from "mongoose"

interface IStepAfterUpload extends Document {
    no: number,
    detail: string,
}
interface IIngredients extends Document {
    name: string,
    calo: number,
    quantitative: string,
    quantitativeUnit: string,
    protein: number,
    carbs: number,
    fat: number,
    sugar: number,
    fiber: number,
    sodium: number,
}
interface INutrion extends Document{
    calo:number
    protein: number,
    carbs: number,
    fat: number,
    sugar: number,
    fiber: number,
    sodium: number,
}
interface IRecipe extends Document {
    name: string,
    type:string,
    Category: Schema.Types.ObjectId,
    description: string,
    nutrion: INutrion,
    ingredients: IIngredients[],
    timeCook: number,
    timePrepare: number,
    steps?: IStepAfterUpload[],
    nPerson?: number,
    timeUpload?: Date,
    image?: string,
    prepare?: string,
    User_id: Schema.Types.ObjectId,
    _id?: string,
    Is_Censored: boolean
}
const nutrionSchema:Schema<INutrion> = new Schema<INutrion>({
    calo: { type: Number, required: true, default: 0 },
    protein: { type: Number, required: true, default: 0 },
    carbs: { type: Number, required: true, default: 0 },
    fat: { type: Number, required: true, default: 0 },
    sugar: { type: Number, required: true, default: 0 },
    fiber: { type: Number, required: true, default: 0 },
    sodium: { type: Number, required: true, default: 0 },
})
const ingredientsSchema: Schema<IIngredients> = new Schema<IIngredients>({
    name: { type: String, required: true },
    calo: { type: Number, required: true, default: 0 },
    quantitative: { type: String, required: true },
    quantitativeUnit: { type: String, required: true },
    protein: { type: Number, required: true, default: 0 },
    carbs: { type: Number, required: true, default: 0 },
    fat: { type: Number, required: true, default: 0 },
    sugar: { type: Number, required: true, default: 0 },
    fiber: { type: Number, required: true, default: 0 },
    sodium: { type: Number, required: true, default: 0 },
})
const stepSchema: Schema<IStepAfterUpload> = new Schema<IStepAfterUpload>({
    no: { type: Number, required: true, minlength: 1 },
    detail: { type: String, required: true },

})

const recipeSchema: Schema<IRecipe> = new Schema<IRecipe>({
    name: { type: String, required: true },
    description: { type: String },
    type: {type: String, required:true, default:'Main', enum:['Main','Side']},
    nutrion:{type:nutrionSchema ,required:true},
    ingredients: [ingredientsSchema],
    timeCook: { type: Number, required: true, minlength: 1 },
    timePrepare: { type: Number, required: true, minlength: 1 },
    steps: [stepSchema],
    nPerson: { type: Number, minlength: 1 },
    timeUpload: { type: Date, required: true, default: new Date() },
    image: { type: String, required: true },
    prepare: { type: String },
    Category: { type: String, required: true, ref: 'Category', select: 'name' },
    User_id: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    Is_Censored: { type: Boolean, default: false }
})
export { recipeSchema, IRecipe }