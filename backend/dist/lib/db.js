import mongoose from "mongoose";
let cached = global._mongooseCached ?? {
    conn: null,
    promise: null,
};
global._mongooseCached = cached;
export async function connectDB() {
    if (cached.conn)
        return cached.conn;
    if (!cached.promise) {
        const uri = process.env.MONGODB_URI;
        if (!uri)
            throw new Error("MONGODB_URI missing");
        mongoose.set("strictQuery", true);
        mongoose.set("bufferCommands", false);
        cached.promise = mongoose
            .connect(uri, { serverSelectionTimeoutMS: 5000 })
            .then((m) => {
            cached.conn = m;
            // 🔴 Optional debug hooks (remove later)
            mongoose.connection.on("connected", () => console.log("[mongo] connected"));
            mongoose.connection.on("error", (e) => console.error("[mongo] error", e));
            mongoose.connection.on("disconnected", () => console.warn("[mongo] disconnected"));
            return m;
        })
            .catch((err) => {
            cached.promise = null;
            throw err;
        });
    }
    return cached.promise;
}
//# sourceMappingURL=db.js.map