import { Schema, model } from "mongoose"

interface IArticle extends Document{
    _id?:Schema.Types.ObjectId,
    title:string,
    timeUpload?:Date,
    content:string,
    hashtag?:string,
    userId: Schema.Types.ObjectId,
    isShared:boolean,
    Article_id?:Schema.Types.ObjectId,
    Is_Censored:boolean
}

const articleSchema:Schema<IArticle> = new Schema<IArticle>({
    title:      { type: String, required: true },
    timeUpload: { type: Date,   required: true },
    content:    { type: String, required: true },
    hashtag:     { type: String },
    userId: { type:Schema.Types.ObjectId, required: true, ref: 'User'},
    isShared: {type: Boolean, required: true, default:false},
    Article_id: {type:Schema.Types.ObjectId, ref: 'Article'},
    Is_Censored: {type: Boolean, required: true, default:false}
})

export {IArticle, articleSchema}