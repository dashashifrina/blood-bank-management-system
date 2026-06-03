import { describe, it, expect } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { createTestApp } from "./testApp.js";
import Facility from "../models/facilityModel.js";
import {
  isCompatible,
  getCompatibleDonors,
  getCompatibleRecipients,
} from "../utils/bloodTypeCompatibility.js";

const app = createTestApp();

/* ==============================================================
   UNIT TESTS — bloodTypeCompatibility utility
   ============================================================== */

describe("isCompatible", () => {
  // Universal donor
  it("TC-BT-01: O- (universal donor) is compatible with AB+", () => {
    expect(isCompatible("O-", "AB+")).toBe(true);
  });

  it("TC-BT-02: O- is compatible with every blood type", () => {
    const all = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
    for (const recipient of all) {
      expect(isCompatible("O-", recipient)).toBe(true);
    }
  });

  // Universal recipient
  it("TC-BT-03: any blood type can donate to AB+ (universal recipient)", () => {
    const all = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
    for (const donor of all) {
      expect(isCompatible(donor, "AB+")).toBe(true);
    }
  });

  // Same-type compatibility
  it("TC-BT-04: same-type A+ -> A+ is compatible", () => {
    expect(isCompatible("A+", "A+")).toBe(true);
  });

  it("TC-BT-05: same-type O- -> O- is compatible", () => {
    expect(isCompatible("O-", "O-")).toBe(true);
  });

  it("TC-BT-06: same-type AB- -> AB- is compatible", () => {
    expect(isCompatible("AB-", "AB-")).toBe(true);
  });

  // Cross-type incompatible
  it("TC-BT-07: A+ -> B+ is incompatible", () => {
    expect(isCompatible("A+", "B+")).toBe(false);
  });

  it("TC-BT-08: B+ -> A+ is incompatible", () => {
    expect(isCompatible("B+", "A+")).toBe(false);
  });

  it("TC-BT-09: AB+ -> O+ is incompatible (AB+ can only donate to AB+)", () => {
    expect(isCompatible("AB+", "O+")).toBe(false);
  });

  it("TC-BT-10: AB+ -> A- is incompatible", () => {
    expect(isCompatible("AB+", "A-")).toBe(false);
  });

  // Rh factor rules
  it("TC-BT-11: A- (Rh-) can donate to A+ (Rh+ same ABO)", () => {
    expect(isCompatible("A-", "A+")).toBe(true);
  });

  it("TC-BT-12: A+ (Rh+) cannot donate to A- (Rh-)", () => {
    expect(isCompatible("A+", "A-")).toBe(false);
  });

  it("TC-BT-13: B- can donate to B+ (Rh- to Rh+ same group)", () => {
    expect(isCompatible("B-", "B+")).toBe(true);
  });

  it("TC-BT-14: B+ cannot donate to B- (Rh+ cannot donate to Rh-)", () => {
    expect(isCompatible("B+", "B-")).toBe(false);
  });

  it("TC-BT-15: O+ cannot donate to O- (Rh+ to Rh-)", () => {
    expect(isCompatible("O+", "O-")).toBe(false);
  });

  // Invalid inputs
  it("TC-BT-16: invalid donor type returns false", () => {
    expect(isCompatible("X+", "AB+")).toBe(false);
  });

  it("TC-BT-17: invalid recipient type returns false", () => {
    expect(isCompatible("O-", "Z-")).toBe(false);
  });

  it("TC-BT-18: both invalid types returns false", () => {
    expect(isCompatible("X+", "Y-")).toBe(false);
  });

  it("TC-BT-19: null inputs return false", () => {
    expect(isCompatible(null, "AB+")).toBe(false);
    expect(isCompatible("O-", null)).toBe(false);
  });

  it("TC-BT-20: empty string inputs return false", () => {
    expect(isCompatible("", "AB+")).toBe(false);
  });
});

describe("getCompatibleDonors", () => {
  it("TC-BT-21: AB+ recipient can receive from all 8 types", () => {
    const donors = getCompatibleDonors("AB+");
    const all = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
    expect(donors.sort()).toEqual(all.sort());
  });

  it("TC-BT-22: O- recipient can only receive from O-", () => {
    const donors = getCompatibleDonors("O-");
    expect(donors).toEqual(["O-"]);
  });

  it("TC-BT-23: A+ recipient can receive from O-, O+, A-, A+", () => {
    const donors = getCompatibleDonors("A+");
    expect(donors.sort()).toEqual(["A+", "A-", "O+", "O-"].sort());
  });

  it("TC-BT-24: B- recipient can only receive from O- and B-", () => {
    const donors = getCompatibleDonors("B-");
    expect(donors.sort()).toEqual(["B-", "O-"].sort());
  });

  it("TC-BT-25: invalid recipient type returns empty array", () => {
    expect(getCompatibleDonors("X+")).toEqual([]);
  });
});

describe("getCompatibleRecipients", () => {
  it("TC-BT-26: O- (universal donor) can donate to all 8 types", () => {
    const recipients = getCompatibleRecipients("O-");
    const all = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
    expect(recipients.sort()).toEqual(all.sort());
  });

  it("TC-BT-27: AB+ can only donate to AB+", () => {
    expect(getCompatibleRecipients("AB+")).toEqual(["AB+"]);
  });

  it("TC-BT-28: A+ can donate to A+ and AB+", () => {
    const recipients = getCompatibleRecipients("A+");
    expect(recipients.sort()).toEqual(["A+", "AB+"].sort());
  });

  it("TC-BT-29: A- can donate to A-, A+, AB-, AB+", () => {
    const recipients = getCompatibleRecipients("A-");
    expect(recipients.sort()).toEqual(["A+", "A-", "AB+", "AB-"].sort());
  });

  it("TC-BT-30: invalid donor type returns empty array", () => {
    expect(getCompatibleRecipients("Z-")).toEqual([]);
  });
});

/* ==============================================================
   INTEGRATION TESTS — POST /api/hospital/blood/request
   ============================================================== */

/**
 * Seed a hospital and a blood-lab facility, returning auth token + labId.
 * The hospital token is used for Authorization; labId is passed in request body.
 */
async function seedHospitalAndLab() {
  const facilityBase = {
    password: "Secure123!",
    phone: "9000000001",
    emergencyContact: "9000000002",
    address: {
      street: "1 Health St",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
    },
    documents: {
      registrationProof: { url: "https://example.com/doc.pdf" },
    },
    status: "approved",
  };

  const hospital = await Facility.create({
    ...facilityBase,
    name: "City Hospital",
    email: "hospital@test.com",
    registrationNumber: "HOSP001",
    facilityType: "hospital",
    role: "hospital",
  });

  const lab = await Facility.create({
    ...facilityBase,
    name: "Central Blood Lab",
    email: "lab@test.com",
    phone: "9000000003",
    emergencyContact: "9000000004",
    registrationNumber: "LAB001",
    facilityType: "blood-lab",
    role: "blood-lab",
  });

  const token = jwt.sign(
    { id: hospital._id, role: "hospital" },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return { hospital, lab, token };
}

describe("POST /api/hospital/blood/request — compatibility integration", () => {
  it("TC-BT-31: returns 401 without auth token", async () => {
    const res = await request(app)
      .post("/api/hospital/blood/request")
      .send({ labId: "507f1f77bcf86cd799439011", bloodType: "A+", units: 2 });

    expect(res.status).toBe(401);
  });

  it("TC-BT-32: compatible types (O- donated to AB+ patient) returns 201", async () => {
    const { lab, token } = await seedHospitalAndLab();

    const res = await request(app)
      .post("/api/hospital/blood/request")
      .set("Authorization", `Bearer ${token}`)
      .send({
        labId: lab._id.toString(),
        bloodType: "O-",
        units: 2,
        patientBloodType: "AB+",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.bloodType).toBe("O-");
    expect(res.body.data.patientBloodType).toBe("AB+");
  });

  it("TC-BT-33: same-type request (A+ donor to A+ patient) returns 201", async () => {
    const { lab, token } = await seedHospitalAndLab();

    const res = await request(app)
      .post("/api/hospital/blood/request")
      .set("Authorization", `Bearer ${token}`)
      .send({
        labId: lab._id.toString(),
        bloodType: "A+",
        units: 1,
        patientBloodType: "A+",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it("TC-BT-34: incompatible types (A+ donated to B+ patient) returns 400 with message", async () => {
    const { lab, token } = await seedHospitalAndLab();

    const res = await request(app)
      .post("/api/hospital/blood/request")
      .set("Authorization", `Bearer ${token}`)
      .send({
        labId: lab._id.toString(),
        bloodType: "A+",
        units: 2,
        patientBloodType: "B+",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/incompatible blood type/i);
    expect(res.body.message).toContain("A+");
    expect(res.body.message).toContain("B+");
  });

  it("TC-BT-35: request without patientBloodType works (backward compatible) — returns 201", async () => {
    const { lab, token } = await seedHospitalAndLab();

    const res = await request(app)
      .post("/api/hospital/blood/request")
      .set("Authorization", `Bearer ${token}`)
      .send({
        labId: lab._id.toString(),
        bloodType: "B+",
        units: 3,
        // patientBloodType intentionally omitted
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.patientBloodType).toBeUndefined();
  });

  it("TC-BT-36: O+ cannot be given to O- patient — returns 400", async () => {
    const { lab, token } = await seedHospitalAndLab();

    const res = await request(app)
      .post("/api/hospital/blood/request")
      .set("Authorization", `Bearer ${token}`)
      .send({
        labId: lab._id.toString(),
        bloodType: "O+",
        units: 1,
        patientBloodType: "O-",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/incompatible blood type/i);
  });
});
