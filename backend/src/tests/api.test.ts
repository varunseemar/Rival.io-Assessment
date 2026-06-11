import request from "supertest";
import { createApp } from "../app";
import { prisma } from "../lib/prisma";

const app = createApp();

// Unique emails per run so tests are repeatable without manual cleanup.
const stamp = Date.now();
const alice = { email: `alice_${stamp}@test.com`, password: "password123" };
const bob = { email: `bob_${stamp}@test.com`, password: "password123" };

const createdUserIds: string[] = [];

afterAll(async () => {
  // Clean up users created by this run (tasks cascade-delete).
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  await prisma.$disconnect();
});

/** Signs up a user and returns their auth cookie. */
async function signupAndGetCookie(creds: { email: string; password: string }): Promise<string> {
  const res = await request(app).post("/auth/signup").send(creds);
  expect(res.status).toBe(201);
  createdUserIds.push(res.body.user.id);
  return res.headers["set-cookie"][0];
}

describe("Auth", () => {
  it("rejects signup with an invalid email (400)", async () => {
    const res = await request(app)
      .post("/auth/signup")
      .send({ email: "not-an-email", password: "password123" });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe("Validation failed");
  });

  it("signs up, returns the user, and rehydrates via /auth/me", async () => {
    const cookie = await signupAndGetCookie(alice);
    const me = await request(app).get("/auth/me").set("Cookie", cookie);
    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe(alice.email);
  });

  it("rejects login with a wrong password (401)", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: alice.email, password: "wrongpassword" });
    expect(res.status).toBe(401);
  });
});

describe("Tasks", () => {
  it("blocks unauthenticated access to /tasks (401)", async () => {
    const res = await request(app).get("/tasks");
    expect(res.status).toBe(401);
  });

  it("creates a task and lists it back with pagination metadata", async () => {
    const cookie = await signupAndGetCookie(bob);
    const create = await request(app)
      .post("/tasks")
      .set("Cookie", cookie)
      .send({ title: "Bob's task", priority: "HIGH", status: "TODO" });
    expect(create.status).toBe(201);
    expect(create.body.task.title).toBe("Bob's task");

    const list = await request(app).get("/tasks").set("Cookie", cookie);
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(1);
    expect(list.body.pagination.total).toBe(1);
  });

  it("rejects an invalid task body (400)", async () => {
    const cookie = await signupAndGetCookie({
      email: `carol_${stamp}@test.com`,
      password: "password123",
    });
    const res = await request(app).post("/tasks").set("Cookie", cookie).send({ title: "" });
    expect(res.status).toBe(400);
  });

  it("prevents a user from accessing another user's task (404)", async () => {
    const aliceCookie = await signupAndGetCookie({
      email: `alice2_${stamp}@test.com`,
      password: "password123",
    });
    const bobCookie = await signupAndGetCookie({
      email: `bob2_${stamp}@test.com`,
      password: "password123",
    });

    const created = await request(app)
      .post("/tasks")
      .set("Cookie", aliceCookie)
      .send({ title: "Alice private task" });
    const taskId = created.body.task.id;

    // Bob must not be able to read or modify Alice's task.
    const get = await request(app).get(`/tasks/${taskId}`).set("Cookie", bobCookie);
    expect(get.status).toBe(404);

    const patch = await request(app)
      .patch(`/tasks/${taskId}`)
      .set("Cookie", bobCookie)
      .send({ status: "DONE" });
    expect(patch.status).toBe(404);
  });
});
