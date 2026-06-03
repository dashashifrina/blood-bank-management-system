import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { createTestApp } from "./testApp.js";
import Donor from "../models/donorModel.js";

const app = createTestApp();

// Base valid donor payload
const validDonorPayload = {
  role: "donor",
  fullName: "Jane Doe",
  email: "jane@donor.com",
  password: "secure123",
  phone: "9876500001",
  bloodGroup: "AB+",
  age: 22,
  gender: "Female",
  weight: 52,
  address: {
    street: "10 Rose Lane",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411001",
  },
};

// Helper: create donor directly in DB and return token
async function seedDonorAndToken(overrides = {}) {
  const donor = await Donor.create({ ...validDonorPayload, ...overrides });
  const token = jwt.sign(
    { id: donor._id, role: "donor" },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  return { donor, token };
}

describe("POST /api/auth/register — donor validation", () => {
  it("TC-18: should reject registration with an invalid blood group", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...validDonorPayload, bloodGroup: "X+" });

    expect(res.status).toBe(500); // Mongoose validation error surfaces as 500 from controller
    expect(res.body.message).toMatch(/registration failed/i);
  });

  it("TC-19: should reject registration with a duplicate email", async () => {
    // First registration — should succeed
    await request(app)
      .post("/api/auth/register")
      .send(validDonorPayload);

    // Second registration with the same email — should fail
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...validDonorPayload, phone: "9876500099" });

    expect(res.status).toBe(500); // Mongo duplicate key → caught by controller
    expect(res.body.message).toMatch(/registration failed/i);
  });

  it("TC-20: should reject donor under 18 years old", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...validDonorPayload, age: 15, email: "young@donor.com" });

    expect(res.status).toBe(500);
    expect(res.body.message).toMatch(/registration failed/i);
  });
});

describe("GET /api/donor/profile", () => {
  it("TC-21: should return 401 without a token", async () => {
    const res = await request(app).get("/api/donor/profile");
    expect(res.status).toBe(401);
  });

  it("TC-22: should return 200 + donor profile with a valid donor token", async () => {
    const { token } = await seedDonorAndToken();

    const res = await request(app)
      .get("/api/donor/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.donor).toBeDefined();
    expect(res.body.donor.email).toBe(validDonorPayload.email);
    expect(res.body.donor.bloodGroup).toBe(validDonorPayload.bloodGroup);
    // Password must NOT be present
    expect(res.body.donor.password).toBeUndefined();
  });
});

describe("PUT /api/donor/profile", () => {
  it("TC-23: should return 401 when updating profile without a token", async () => {
    const res = await request(app)
      .put("/api/donor/profile")
      .send({ fullName: "Updated Name" });

    expect(res.status).toBe(401);
  });

  it("TC-24: should update donor full name when authenticated", async () => {
    const { token } = await seedDonorAndToken();

    const res = await request(app)
      .put("/api/donor/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ fullName: "Jane Updated" });

    expect(res.status).toBe(200);
    expect(res.body.donor.fullName).toBe("Jane Updated");
  });
});

describe("GET /api/donor/stats", () => {
  it("TC-25: should return 401 without a token", async () => {
    const res = await request(app).get("/api/donor/stats");
    expect(res.status).toBe(401);
  });

  it("TC-26: should return 200 + dashboard stats for an authenticated donor", async () => {
    const { token } = await seedDonorAndToken({ email: "stats@donor.com", phone: "9800000001" });

    const res = await request(app)
      .get("/api/donor/stats")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.dashboard).toBeDefined();
    expect(res.body.dashboard).toHaveProperty("totalDonations");
    expect(res.body.dashboard).toHaveProperty("eligibilityStatus");
  });
});
