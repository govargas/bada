import mongoose, { Schema, model } from "mongoose";
const favoriteSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    // HaV beach identifier (string)
    beachId: { type: String, required: true, index: true },
    // optional user note
    note: { type: String, default: "" },
    // for drag & drop ordering (lower = earlier)
    order: { type: Number, default: 0 },
}, { timestamps: true });
// Prevent duplicates: one user can favorite each beach only once
favoriteSchema.index({ userId: 1, beachId: 1 }, { unique: true });
export const Favorite = mongoose.models.Favorite ??
    model("Favorite", favoriteSchema);
//# sourceMappingURL=Favorite.js.map