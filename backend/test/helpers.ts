import request from "supertest";
import app from "../src/index.js";

export { app };

/** Register a user and return their bearer token. */
export async function registerAndLogin(
  email: string,
  password = "testpass123"
): Promise<string> {
  await request(app).post("/api/auth/register").send({ email, password });
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email, password });
  return res.body.token as string;
}

export function auth(token: string) {
  return `Bearer ${token}`;
}
