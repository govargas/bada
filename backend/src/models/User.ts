import mongoose, { Schema, model, InferSchemaType, Model } from "mongoose";

const userSchema = new Schema(
  {
    email: { type: String, unique: true, required: true, index: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

// Infer the document shape from the schema
export type UserDoc = InferSchemaType<typeof userSchema>;

// Always return a single, strongly-typed Model<UserDoc> (no union)
export const User: Model<UserDoc> =
  (mongoose.models.User as Model<UserDoc>) ??
  model<UserDoc>("User", userSchema);
