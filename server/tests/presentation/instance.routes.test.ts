import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createApp } from "../../src/app.js";
import { fakeEvolutionClient, testConfig } from "../helpers.js";

const token = "instance-token-123";

function appWithCookie() {
  const evolutionClient = fakeEvolutionClient();
  const app = createApp({ config: testConfig(), evolutionClient });
  return { app, evolutionClient };
}

describe("instance proxy", () => {
  it("should reject status without a session", async () => {
    const { app } = appWithCookie();
    const response = await request(app).get("/api/v1/instance/status");

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("unauthorized");
  });

  it("should return camelCase status for the cookie token", async () => {
    const { app, evolutionClient } = appWithCookie();
    const getStatus = vi.spyOn(evolutionClient, "getStatus");

    const response = await request(app)
      .get("/api/v1/instance/status")
      .set("Cookie", `instance_session=${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: { connected: false, loggedIn: false, name: "Loja" },
    });
    expect(getStatus).toHaveBeenCalledWith(token);
    expect(JSON.stringify(response.body)).not.toContain(token);
  });

  it("should not expose logout, create, or delete", async () => {
    const { app } = appWithCookie();
    const cookie = `instance_session=${token}`;

    const logout = await request(app)
      .delete("/api/v1/instance/logout")
      .set("Cookie", cookie);
    const create = await request(app)
      .post("/api/v1/instance/create")
      .set("Cookie", cookie)
      .send({});
    const remove = await request(app)
      .delete("/api/v1/instance/delete/abc")
      .set("Cookie", cookie);

    expect(logout.status).toBe(404);
    expect(create.status).toBe(404);
    expect(remove.status).toBe(404);
  });
});
