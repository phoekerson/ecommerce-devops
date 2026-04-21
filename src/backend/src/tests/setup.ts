import request from "supertest";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_secret_key_minimum_32_characters_long";
process.env.CORS_ORIGIN = "http://localhost:3000";
process.env.DB_HOST = process.env.DB_HOST || "localhost";
process.env.DB_PORT = process.env.DB_PORT || "5432";
process.env.DB_NAME = process.env.DB_NAME || "ecommerce_test";
process.env.DB_USER = process.env.DB_USER || "ecommerce_user";
process.env.DB_PASSWORD = process.env.DB_PASSWORD || "test_password";

import { app } from "../server";
import { sequelize } from "../config/database";
import { User } from "../models/User";

jest.setTimeout(30000);

beforeAll(async () => {
  await sequelize.authenticate();
  await sequelize.sync({ force: true });
});

beforeEach(async () => {
  await sequelize.truncate({ cascade: true, restartIdentity: true });
});

afterAll(async () => {
  await sequelize.close();
});

export const createTestUser = async () => {
  return User.create({
    email: "user@test.com",
    password: "password123",
    firstName: "John",
    lastName: "Doe",
    role: "user"
  });
};

export const createAdminUser = async () => {
  return User.create({
    email: "admin@test.com",
    password: "password123",
    firstName: "Admin",
    lastName: "User",
    role: "admin"
  });
};

export const getAuthToken = async (email: string, password: string): Promise<string> => {
  const response = await request(app).post("/api/auth/login").send({ email, password });
  if (response.status !== 200 || !response.body.token) {
    throw new Error(
      `Unable to get auth token for ${email}. Status=${response.status}, body=${JSON.stringify(response.body)}`
    );
  }
  return response.body.token as string;
};