import {model,Schema} from "mongoose"

interface Category extends Document{
    _id?:string
    name:string,
    image:string,
    description?:string
}
const categorySchema:Schema<Category> = new Schema<Category>({
    name: { type: String, required: true },
    image:{ type: String, required:true },
    description: { type: String}
})
export {Category, categorySchema}