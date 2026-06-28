import { beforeAll, afterAll, afterEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// Spin up an isolated in-memory MongoDB so tests never touch a real database.
let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
  // The app's connectDB() reuses this same mongoose connection.
  await mongoose.connect(process.env.MONGODB_URI);
});

afterEach(async () => {
  // Clean slate between tests.
  const { collections } = mongoose.connection;
  for (const name of Object.keys(collections)) {
    await collections[name].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});
