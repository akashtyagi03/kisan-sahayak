import mongoose, { Document } from 'mongoose';
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
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export declare const Data: mongoose.Model<IData, {}, {}, {}, mongoose.Document<unknown, {}, IData, {}, {}> & IData & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=db.d.ts.map