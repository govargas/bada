import { describe, it, expect } from "vitest";
import request from "supertest";
import { app, registerAndLogin, auth } from "./helpers.js";

describe("auth", () => {
  it("registers a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "a@example.com", password: "testpass123" });
    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
  });

  it("rejects duplicate email with 409", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ email: "dup@example.com", password: "testpass123" });
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "dup@example.com", password: "testpass123" });
    expect(res.status).toBe(409);
    expect(res.body.error).toBe("EmailInUse");
  });

  it("rejects a too-short password with 400", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "short@example.com", password: "123" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("InvalidBody");
  });

  it("logs in with valid credentials and returns a JWT", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ email: "login@example.com", password: "testpass123" });
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "login@example.com", password: "testpass123" });
    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe("string");
    expect(res.body.token.startsWith("eyJ")).toBe(true);
  });

  it("rejects a wrong password with 401", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ email: "wrong@example.com", password: "testpass123" });
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "wrong@example.com", password: "nottherightone" });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("InvalidCredentials");
  });

  it("does not reveal whether an email exists (same 401 for unknown user)", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "ghost@example.com", password: "testpass123" });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("InvalidCredentials");
  });

  describe("account deletion", () => {
    it("requires auth", async () => {
      const res = await request(app).delete("/api/auth/me");
      expect(res.status).toBe(401);
    });

    it("deletes the user and prevents future login", async () => {
      const token = await registerAndLogin("del@example.com");
      const del = await request(app)
        .delete("/api/auth/me")
        .set("Authorization", auth(token));
      expect(del.status).toBe(200);

      const login = await request(app)
        .post("/api/auth/login")
        .send({ email: "del@example.com", password: "testpass123" });
      expect(login.status).toBe(401);
    });
  });
});
