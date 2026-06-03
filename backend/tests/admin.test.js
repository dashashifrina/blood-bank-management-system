import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createTestApp } from "./testApp.js";
import Admin from "../models/adminModel.js";
import Donor from "../models/donorModel.js";

const app = createTestApp();

// Helper: create an admin and return a valid JWT for it
async function createAdminAndToken() {
  const hashedPassword = await bcrypt.hash("admin123", 12);
  const admin = await Admin.create({
    name: "Admin User",
    email: "admin@bbms.com",
    password: hashedPassword,
    role: "admin",
  });
  const token = jwt.sign(
    { id: admin._id, role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  return { admin, token };
}

// Helper: create a donor
async function createDonor(overrides = {}) {
  return Donor.create({
    fullName: "Sample Donor",
    email: "sample@donor.com",
    password: "password123",
    phone: "9000000001",
    bloodGroup: "B+",
    age: 30,
    gender: "Male",
    weight: 68,
    address: {
      street: "1 Blood Ave",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600001",
    },
    ...overrides,
  });
}

describe("GET /api/admin/donors", () => {
  it("TC-10: should return 200 + donor list (no auth required)", async () => {
    await createDonor();

    const res = await request(app).get("/api/admin/donors");

    expect(res.status).toBe(200);
    expect(res.body.donors).toBeDefined();
    expect(Array.isArray(res.body.donors)).toBe(true);
    expect(res.body.donors.length).toBeGreaterThanOrEqual(1);
    // Password must NOT be exposed
    expect(res.body.donors[0].password).toBeUndefined();
  });

  it("TC-11: should return empty array when no donors exist", async () => {
    const res = await request(app).get("/api/admin/donors");

    expect(res.status).toBe(200);
    expect(res.body.donors).toHaveLength(0);
  });
});

describe("GET /api/admin/dashboard", () => {
  it("TC-12: should return 401 without auth token", async () => {
    const res = await request(app).get("/api/admin/dashboard");

    expect(res.status).toBe(401);
  });

  it("TC-13: should return 401 with an invalid token", async () => {
    const res = await request(app)
      .get("/api/admin/dashboard")
      .set("Authorization", "Bearer invalidtoken");

    expect(res.status).toBe(401);
  });

  it("TC-14: should return 200 + stats object with expected keys for authenticated admin", async () => {
    const { token } = await createAdminAndToken();
    await createDonor();

    const res = await request(app)
      .get("/api/admin/dashboard")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("totalDonors");
    expect(res.body).toHaveProperty("totalFacilities");
    expect(res.body).toHaveProperty("totalDonations");
    expect(res.body).toHaveProperty("pendingFacilities");
    expect(res.body).toHaveProperty("approvedFacilities");
    expect(typeof res.body.totalDonors).toBe("number");
  });

  it("TC-15: should reflect correct donor count in dashboard stats", async () => {
    const { token } = await createAdminAndToken();
    await createDonor();
    await createDonor({ email: "donor2@test.com", phone: "9000000002" });

    const res = await request(app)
      .get("/api/admin/dashboard")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.totalDonors).toBe(2);
  });
});

describe("GET /api/admin/facilities", () => {
  it("TC-16: should return 401 without auth token", async () => {
    const res = await request(app).get("/api/admin/facilities");
    expect(res.status).toBe(401);
  });

  it("TC-17: should return 200 + facilities array with valid token", async () => {
    const { token } = await createAdminAndToken();

    const res = await request(app)
      .get("/api/admin/facilities")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.facilities).toBeDefined();
    expect(Array.isArray(res.body.facilities)).toBe(true);
  });
});
