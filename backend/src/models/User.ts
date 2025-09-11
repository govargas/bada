import { Schema, model, models, InferSchemaType, Model } from "mongoose";

const userSchema = new Schema(
  {
    email: { type: String, unique: true, required: true, index: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

// Document type inferred from schema
export type UserDoc = InferSchemaType<typeof userSchema>;

// Single, strongly-typed Model<UserDoc> (no union)
export const User: Model<UserDoc> =
  (models.User as Model<UserDoc>) ?? model<UserDoc>("User", userSchema);
