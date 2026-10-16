
import { beforeAll, describe, expect, it } from "@jest/globals";
import request from "supertest";

// Use a test-only fallback. Never reuse this value as a real JWT secret.
process.env.JWT_SECRET ||= "taskflow-day7-test-only-secret";

let app;

beforeAll(async () => {
  const module = await import("../src/app.js");
  app = module.default;
});

describe("TaskFlow API smoke tests", () => {
  it("returns the welcome response", async () => {
    const response = await request(app)
      .get("/")
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Welcome to TaskFlow API");
  });

  it("returns a successful health check", async () => {
    const response = await request(app)
      .get("/api/health")
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("TaskFlow API is running");
  });

  it("rejects protected board access without a JWT cookie", async () => {
    await request(app)
      .get("/api/boards")
      .expect(401);
  });

  it("rejects a registration request with missing fields", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({})
      .expect(400);

    expect(response.body.success).toBe(false);
  });

  it("returns 404 for an unknown endpoint", async () => {
    const response = await request(app)
      .get("/api/does-not-exist")
      .expect(404);

    expect(response.body.success).toBe(false);
  });
});
