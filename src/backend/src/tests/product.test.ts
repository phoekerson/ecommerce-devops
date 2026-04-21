import request from "supertest";
import { app } from "../server";
import { Product } from "../models/Product";
import { createAdminUser, createTestUser, getAuthToken } from "./setup";

const seedProducts = async () => {
  await Product.bulkCreate([
    {
      name: "Gaming Laptop",
      description: "High performance laptop",
      price: "1299.99",
      imageUrl: "https://example.com/laptop.png",
      stock: 10,
      category: "electronics"
    },
    {
      name: "Running Shoes",
      description: "Comfortable running shoes",
      price: "89.99",
      imageUrl: "https://example.com/shoes.png",
      stock: 25,
      category: "sports"
    },
    {
      name: "Wireless Mouse",
      description: "Ergonomic wireless mouse",
      price: "39.99",
      imageUrl: "https://example.com/mouse.png",
      stock: 50,
      category: "electronics"
    }
  ]);
};

describe("GET /api/products", () => {
  it("should return paginated products (200)", async () => {
    await seedProducts();

    const response = await request(app).get("/api/products?page=1&limit=2");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data).toHaveLength(2);
  });

  it("should filter by category", async () => {
    await seedProducts();

    const response = await request(app).get("/api/products?category=electronics");

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThan(0);
    for (const product of response.body.data) {
      expect(product.category).toBe("electronics");
    }
  });

  it("should search by name", async () => {
    await seedProducts();

    const response = await request(app).get("/api/products?search=laptop");

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0].name.toLowerCase()).toContain("laptop");
  });

  it("should return correct pagination metadata", async () => {
    await seedProducts();

    const response = await request(app).get("/api/products?page=1&limit=2");

    expect(response.status).toBe(200);
    expect(response.body.pagination).toMatchObject({
      page: 1,
      limit: 2,
      total: 3,
      pages: 2
    });
  });
});

describe("GET /api/products/:id", () => {
  it("should return a product by id (200)", async () => {
    const product = await Product.create({
      name: "Desk Lamp",
      description: "Modern desk lamp",
      price: "24.99",
      imageUrl: "https://example.com/lamp.png",
      stock: 12,
      category: "home"
    });

    const response = await request(app).get(`/api/products/${product.id}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(product.id);
    expect(response.body.name).toBe("Desk Lamp");
  });

  it("should return 404 for unknown id", async () => {
    const response = await request(app).get("/api/products/9999");

    expect(response.status).toBe(404);
    expect(response.body.message).toContain("Product not found");
  });
});

describe("POST /api/products", () => {
  const validPayload = {
    name: "Smartphone",
    description: "Latest flagship smartphone",
    price: "999.99",
    imageUrl: "https://example.com/phone.png",
    stock: 40,
    category: "electronics"
  };

  it("should create product as admin (201)", async () => {
    await createAdminUser();
    const adminToken = await getAuthToken("admin@test.com", "password123");

    const response = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(validPayload);

    expect(response.status).toBe(201);
    expect(response.body.name).toBe(validPayload.name);
  });

  it("should reject creation as regular user (403)", async () => {
    await createTestUser();
    const userToken = await getAuthToken("user@test.com", "password123");

    const response = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${userToken}`)
      .send(validPayload);

    expect(response.status).toBe(403);
    expect(response.body.message).toContain("Admin access required");
  });

  it("should reject creation without auth (401)", async () => {
    const response = await request(app).post("/api/products").send(validPayload);

    expect(response.status).toBe(401);
    expect(response.body.message).toContain("Authentication required");
  });

  it("should validate required fields (400)", async () => {
    await createAdminUser();
    const adminToken = await getAuthToken("admin@test.com", "password123");

    const response = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ description: "Missing name and other fields" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBeTruthy();
  });
});

describe("PUT /api/products/:id", () => {
  it("should update product as admin (200)", async () => {
    await createAdminUser();
    const adminToken = await getAuthToken("admin@test.com", "password123");
    const product = await Product.create({
      name: "Old Name",
      description: "Old description",
      price: "19.99",
      imageUrl: "https://example.com/item.png",
      stock: 10,
      category: "home"
    });

    const response = await request(app)
      .put(`/api/products/${product.id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "New Name", stock: 15 });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("New Name");
    expect(response.body.stock).toBe(15);
  });

  it("should reject update as user (403)", async () => {
    await createTestUser();
    const userToken = await getAuthToken("user@test.com", "password123");
    const product = await Product.create({
      name: "Protected Product",
      description: "Should not be updated by user",
      price: "10.00",
      imageUrl: "https://example.com/protected.png",
      stock: 5,
      category: "home"
    });

    const response = await request(app)
      .put(`/api/products/${product.id}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ name: "Illegal Update" });

    expect(response.status).toBe(403);
    expect(response.body.message).toContain("Admin access required");
  });
});

describe("DELETE /api/products/:id", () => {
  it("should delete product as admin (204)", async () => {
    await createAdminUser();
    const adminToken = await getAuthToken("admin@test.com", "password123");
    const product = await Product.create({
      name: "Delete Me",
      description: "To be deleted",
      price: "12.00",
      imageUrl: "https://example.com/delete.png",
      stock: 9,
      category: "home"
    });

    const response = await request(app)
      .delete(`/api/products/${product.id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(204);

    const deleted = await Product.findByPk(product.id);
    expect(deleted).toBeNull();
  });

  it("should return 404 if not found", async () => {
    await createAdminUser();
    const adminToken = await getAuthToken("admin@test.com", "password123");

    const response = await request(app)
      .delete("/api/products/9999")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toContain("Product not found");
  });
});
