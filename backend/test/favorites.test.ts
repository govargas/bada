import { describe, it, expect } from "vitest";
import request from "supertest";
import { app, registerAndLogin, auth } from "./helpers.js";

const BEACH = "SE0441273000000001";
const BEACH_2 = "SE0110000000000001";

describe("favorites", () => {
  it("requires auth to list", async () => {
    const res = await request(app).get("/api/favorites");
    expect(res.status).toBe(401);
  });

  it("creates a favorite and lists it", async () => {
    const token = await registerAndLogin("fav1@example.com");

    const create = await request(app)
      .post("/api/favorites")
      .set("Authorization", auth(token))
      .send({ beachId: BEACH, note: "nice" });
    expect(create.status).toBe(201);
    expect(create.body.beachId).toBe(BEACH);

    const list = await request(app)
      .get("/api/favorites")
      .set("Authorization", auth(token));
    expect(list.status).toBe(200);
    expect(list.body).toHaveLength(1);
    expect(list.body[0].beachId).toBe(BEACH);
  });

  it("rejects a duplicate favorite with 409", async () => {
    const token = await registerAndLogin("fav2@example.com");
    await request(app)
      .post("/api/favorites")
      .set("Authorization", auth(token))
      .send({ beachId: BEACH });
    const dup = await request(app)
      .post("/api/favorites")
      .set("Authorization", auth(token))
      .send({ beachId: BEACH });
    expect(dup.status).toBe(409);
    expect(dup.body.error).toBe("AlreadyFavorited");
  });

  it("rejects an invalid body with 400", async () => {
    const token = await registerAndLogin("fav3@example.com");
    const res = await request(app)
      .post("/api/favorites")
      .set("Authorization", auth(token))
      .send({ beachId: "" });
    expect(res.status).toBe(400);
  });

  it("removes a favorite by beach id", async () => {
    const token = await registerAndLogin("fav4@example.com");
    await request(app)
      .post("/api/favorites")
      .set("Authorization", auth(token))
      .send({ beachId: BEACH });

    const del = await request(app)
      .delete(`/api/favorites/by-beach/${BEACH}`)
      .set("Authorization", auth(token));
    expect(del.status).toBe(200);

    const list = await request(app)
      .get("/api/favorites")
      .set("Authorization", auth(token));
    expect(list.body).toHaveLength(0);
  });

  it("persists a custom order via reorder", async () => {
    const token = await registerAndLogin("fav5@example.com");
    await request(app)
      .post("/api/favorites")
      .set("Authorization", auth(token))
      .send({ beachId: BEACH });
    await request(app)
      .post("/api/favorites")
      .set("Authorization", auth(token))
      .send({ beachId: BEACH_2 });

    const reorder = await request(app)
      .patch("/api/favorites/reorder")
      .set("Authorization", auth(token))
      .send({ order: [BEACH_2, BEACH] });
    expect(reorder.status).toBe(204);

    const list = await request(app)
      .get("/api/favorites")
      .set("Authorization", auth(token));
    expect(list.body.map((f: { beachId: string }) => f.beachId)).toEqual([
      BEACH_2,
      BEACH,
    ]);
  });

  it("scopes favorites to the owner (one user cannot see another's)", async () => {
    const tokenA = await registerAndLogin("ownerA@example.com");
    const tokenB = await registerAndLogin("ownerB@example.com");

    await request(app)
      .post("/api/favorites")
      .set("Authorization", auth(tokenA))
      .send({ beachId: BEACH });

    const listB = await request(app)
      .get("/api/favorites")
      .set("Authorization", auth(tokenB));
    expect(listB.status).toBe(200);
    expect(listB.body).toHaveLength(0);
  });
});
