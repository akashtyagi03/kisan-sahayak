import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
}

export interface IData extends Document {
    State_Name: string;
    District_Name: string;
    N_Value: number;
    P_Value: number;
    K_Value: number;
    pH_Value: number;
}

const UserSchema: Schema<IUser> = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const DataSchema: Schema<IData> = new Schema({
    State_Name: { type: String, required: true },
    District_Name: { type: String, required: true },
    N_Value: { type: Number, required: true },
    P_Value: { type: Number, required: true },
    K_Value: { type: Number, required: true },
    pH_Value: { type: Number, required: true },
}, { collection: 'data' }); 


export const User = mongoose.model<IUser>('User', UserSchema);
export const Data = mongoose.model<IData>('Data', DataSchema);