import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createTestApp } from "./testApp.js";
import Admin from "../models/adminModel.js";
import Donor from "../models/donorModel.js";

const app = createTestApp();

/**
 * Seed helpers — pass plain-text passwords; the Mongoose pre-save hooks hash them.
 */
async function seedAdmin() {
  return Admin.create({
    name: "Test Admin",
    email: "admin@test.com",
    password: "bbms@admin", // pre-save hook hashes this
    role: "admin",
  });
}

async function seedDonor() {
  return Donor.create({
    fullName: "Test Donor",
    email: "donor@test.com",
    password: "password123", // pre-save hook hashes this
    phone: "9876543210",
    bloodGroup: "A+",
    age: 25,
    gender: "Male",
    weight: 70,
    address: {
      street: "123 Test St",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
    },
  });
}

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await seedAdmin();
    await seedDonor();
  });

  it("TC-1: should return 200 + token for valid admin credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "admin@test.com",
      password: "bbms@admin",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe("admin");
    expect(res.body.redirect).toBe("/admin");
  });

  it("TC-2: should return 401 for valid email but wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "admin@test.com",
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid credentials");
  });

  it("TC-3: should return 400 when email is missing", async () => {
    const res = await request(app).post("/api/auth/login").send({
      password: "bbms@admin",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });

  it("TC-4: should return 400 when password is missing", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "admin@test.com",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });

  it("TC-5: should return 404 for non-existent user", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "nobody@test.com",
      password: "password123",
    });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("User not found");
  });

  it("TC-6: should return 200 + donor token for valid donor credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "donor@test.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe("donor");
    expect(res.body.redirect).toBe("/donor");
  });
});

describe("POST /api/auth/register", () => {
  it("TC-7: should return 400 when role is missing", async () => {
    const res = await request(app).post("/api/auth/register").send({
      fullName: "New User",
      email: "newuser@test.com",
      password: "password123",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Role is required");
  });

  it("TC-8: should return 400 for invalid role", async () => {
    const res = await request(app).post("/api/auth/register").send({
      role: "superuser",
      fullName: "New User",
      email: "newuser@test.com",
      password: "password123",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid role");
  });

  it("TC-9: should successfully register a new donor", async () => {
    const res = await request(app).post("/api/auth/register").send({
      role: "donor",
      fullName: "New Donor",
      email: "newdonor@test.com",
      password: "password123",
      phone: "9123456789",
      bloodGroup: "O+",
      age: 28,
      gender: "Female",
      weight: 55,
      address: {
        street: "456 New St",
        city: "Delhi",
        state: "Delhi",
        pincode: "110001",
      },
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe("donor");
    expect(res.body.redirect).toBe("/donor/dashboard");
  });
});
