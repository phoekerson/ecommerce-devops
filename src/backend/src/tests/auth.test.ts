import request from "supertest";
import { app } from "../server";
import { createTestUser, getAuthToken } from "./setup";

describe("POST /api/auth/register", () => {
  it("should register a new user successfully (201)", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "newuser@test.com",
      password: "password123",
      firstName: "Alice",
      lastName: "Smith"
    });

    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe("newuser@test.com");
  });

  it("should return token and user without password", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "secureuser@test.com",
      password: "password123",
      firstName: "Bob",
      lastName: "Brown"
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("token");
    expect(response.body.user).toHaveProperty("id");
    expect(response.body.user).not.toHaveProperty("password");
  });

  it("should reject duplicate email (409)", async () => {
    await createTestUser();

    const response = await request(app).post("/api/auth/register").send({
      email: "user@test.com",
      password: "password123",
      firstName: "John",
      lastName: "Doe"
    });

    expect(response.status).toBe(409);
    expect(response.body.message).toContain("Email already in use");
  });

  it("should reject invalid email format (400)", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "invalid-email",
      password: "password123",
      firstName: "John",
      lastName: "Doe"
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("Valid email required");
  });

  it("should reject password shorter than 6 chars (400)", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "shortpass@test.com",
      password: "123",
      firstName: "John",
      lastName: "Doe"
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("Password must be at least 6 characters");
  });

  it("should reject missing fields (400)", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "missing@test.com"
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBeTruthy();
  });
});

describe("POST /api/auth/login", () => {
  it("should login with valid credentials (200)", async () => {
    await createTestUser();

    const response = await request(app).post("/api/auth/login").send({
      email: "user@test.com",
      password: "password123"
    });

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe("user@test.com");
  });

  it("should return JWT token", async () => {
    await createTestUser();

    const response = await request(app).post("/api/auth/login").send({
      email: "user@test.com",
      password: "password123"
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toEqual(expect.any(String));
  });

  it("should reject wrong password (401)", async () => {
    await createTestUser();

    const response = await request(app).post("/api/auth/login").send({
      email: "user@test.com",
      password: "wrongpassword"
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toContain("Invalid credentials");
  });

  it("should reject unknown email (401)", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "unknown@test.com",
      password: "password123"
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toContain("Invalid credentials");
  });
});

describe("GET /api/auth/me", () => {
  it("should return user profile with valid token (200)", async () => {
    await createTestUser();
    const token = await getAuthToken("user@test.com", "password123");

    const response = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe("user@test.com");
    expect(response.body.user).not.toHaveProperty("password");
  });

  it("should reject request without token (401)", async () => {
    const response = await request(app).get("/api/auth/me");

    expect(response.status).toBe(401);
    expect(response.body.message).toContain("Authentication required");
  });

  it("should reject request with invalid token (401)", async () => {
    const response = await request(app).get("/api/auth/me").set("Authorization", "Bearer invalid_token");

    expect(response.status).toBe(401);
    expect(response.body.message).toContain("Invalid or expired token");
  });
});
