import mongoose, { InferSchemaType, Model } from "mongoose";
declare const favoriteSchema: mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    userId: mongoose.Types.ObjectId;
    beachId: string;
    note: string;
    order: number;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    userId: mongoose.Types.ObjectId;
    beachId: string;
    note: string;
    order: number;
}>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    userId: mongoose.Types.ObjectId;
    beachId: string;
    note: string;
    order: number;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export type FavoriteDoc = InferSchemaType<typeof favoriteSchema>;
export declare const Favorite: Model<FavoriteDoc>;
export {};
//# sourceMappingURL=Favorite.d.ts.map