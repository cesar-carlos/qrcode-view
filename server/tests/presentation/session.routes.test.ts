import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { EvolutionRequestError } from "../../src/application/evolution-request-error.js";
import { createApp } from "../../src/app.js";
import { fakeEvolutionClient, testConfig } from "../helpers.js";

const token = "instance-token-123";

describe("POST /api/v1/session", () => {
  it("should set an httpOnly cookie when the instance token is accepted", async () => {
    const evolutionClient = fakeEvolutionClient();
    const getStatus = vi.spyOn(evolutionClient, "getStatus");
    const app = createApp({ config: testConfig(), evolutionClient });

    const response = await request(app).post("/api/v1/session").send({ token });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: { authenticated: true },
    });
    expect(JSON.stringify(response.body)).not.toContain(token);
    expect(response.headers["set-cookie"]?.[0]).toContain("HttpOnly");
    expect(getStatus).toHaveBeenCalledWith(token);
  });

  it("should reject an unknown instance token", async () => {
    const evolutionClient = fakeEvolutionClient({
      getStatus: async () => {
        throw new EvolutionRequestError(
          "unauthorized",
          "Instance token was rejected",
        );
      },
    });
    const app = createApp({ config: testConfig(), evolutionClient });

    const response = await request(app).post("/api/v1/session").send({ token });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      error: { code: "unauthorized", message: "Invalid instance token" },
    });
    expect(response.headers["set-cookie"]).toBeUndefined();
  });

  it("should reject a missing token", async () => {
    const app = createApp({
      config: testConfig(),
      evolutionClient: fakeEvolutionClient(),
    });
    const response = await request(app).post("/api/v1/session").send({});

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("validation_error");
  });

  it("should reject a foreign origin", async () => {
    const app = createApp({
      config: testConfig(),
      evolutionClient: fakeEvolutionClient(),
    });
    const response = await request(app)
      .post("/api/v1/session")
      .set("Origin", "https://evil.example")
      .send({ token });

    expect(response.status).toBe(401);
  });
});

describe("DELETE /api/v1/session", () => {
  it("should clear the session cookie", async () => {
    const app = createApp({
      config: testConfig(),
      evolutionClient: fakeEvolutionClient(),
    });
    const response = await request(app).delete("/api/v1/session");

    expect(response.status).toBe(204);
    expect(response.headers["set-cookie"]?.[0]).toContain("instance_session");
  });
});
