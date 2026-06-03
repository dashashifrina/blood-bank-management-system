// models/bloodRequestModel.js
import mongoose from "mongoose";

const bloodRequestSchema = new mongoose.Schema({
  hospitalId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Facility", 
    required: true 
  },
  labId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Facility", 
    required: true 
  },
  bloodType: { 
    type: String, 
    required: true,
    enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]
  },
  units: { 
    type: Number, 
    required: true, 
    min: 1 
  },
  status: { 
    type: String, 
    enum: ["pending", "accepted", "rejected"], 
    default: "pending" 
  },
  // Optional: the patient's blood type, used to validate compatibility before requesting
  patientBloodType: {
    type: String,
    enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    // NOT required — omitting this field preserves backward compatibility
  },
  processedAt: Date,
  notes: String
}, { timestamps: true });

export default mongoose.model("BloodRequest", bloodRequestSchema);
