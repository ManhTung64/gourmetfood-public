import { Schema } from "mongoose";

interface IFamily extends Document {
    _id?: Schema.Types.ObjectId,
    user_id: Schema.Types.ObjectId,
    gender: string,
    dob?: Date,
    high: number,
    weight: number,
    activityMode: Schema.Types.ObjectId
    userCalories: number
}
const familySchema: Schema<IFamily> = new Schema<IFamily>({
    user_id: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    dob: { type: Date },
    gender: { type: String, enum: ['male', 'female'] },
    high: { type: Number, minlength: 0 },
    weight: { type: Number, minlength: 0 },
    activityMode: { type: Schema.Types.ObjectId, ref: 'ActivityMode' },
    userCalories: { type: Number },
})
export { IFamily, familySchema }
