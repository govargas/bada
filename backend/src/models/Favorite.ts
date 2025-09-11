import mongoose, { Schema, model, InferSchemaType, Model } from "mongoose";

const favoriteSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    beachId: { type: String, required: true }, // HaV beach identifier (string)
    note: { type: String, default: "" }, // optional user note
    order: { type: Number, default: 0 }, // for drag & drop later
  },
  { timestamps: true }
);

// Prevent duplicates: one user can favorite each beach only once
favoriteSchema.index({ userId: 1, beachId: 1 }, { unique: true });

export type FavoriteDoc = InferSchemaType<typeof favoriteSchema>;

export const Favorite: Model<FavoriteDoc> =
  (mongoose.models.Favorite as Model<FavoriteDoc>) ??
  model<FavoriteDoc>("Favorite", favoriteSchema);
