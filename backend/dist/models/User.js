import mongoose, { Schema, model } from "mongoose";
const userSchema = new Schema({
    email: { type: String, unique: true, required: true, index: true },
    passwordHash: { type: String, required: true },
}, { timestamps: true });
// Always return a single, strongly-typed Model<UserDoc> (no union)
export const User = mongoose.models.User ??
    model("User", userSchema);
//# sourceMappingURL=User.js.map