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

  it("should start a connection without replacing instance settings", async () => {
    const { app, evolutionClient } = appWithCookie();
    const connect = vi.spyOn(evolutionClient, "connect");

    const response = await request(app)
      .post("/api/v1/instance/connect")
      .set("Cookie", `instance_session=${token}`)
      .send({
        webhookUrl: "https://example.test/hook",
        subscribe: ["MESSAGE"],
      });

    expect(response.status).toBe(200);
    expect(connect).toHaveBeenCalledWith(token, {});
  });

  it("should pair with a country code and prefix a Brazilian national number", async () => {
    const { app, evolutionClient } = appWithCookie();
    const pair = vi.spyOn(evolutionClient, "pair");
    const cookie = `instance_session=${token}`;

    const foreign = await request(app)
      .post("/api/v1/instance/pair")
      .set("Cookie", cookie)
      .send({ phone: "+351 912 345 678" });
    const national = await request(app)
      .post("/api/v1/instance/pair")
      .set("Cookie", cookie)
      .send({ phone: "81999999999" });

    expect(foreign.status).toBe(200);
    expect(national.status).toBe(200);
    expect(pair).toHaveBeenNthCalledWith(1, token, { phone: "351912345678" });
    expect(pair).toHaveBeenNthCalledWith(2, token, { phone: "5581999999999" });
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
