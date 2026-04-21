import request from "supertest";
import { app } from "../server";

describe("GET /api/health", () => {
  it("should return status OK (200)", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  it("should return timestamp and uptime", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("timestamp");
    expect(response.body).toHaveProperty("uptime");
    expect(typeof response.body.timestamp).toBe("string");
    expect(typeof response.body.uptime).toBe("number");
  });
});
