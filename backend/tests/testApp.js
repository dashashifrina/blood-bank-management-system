/**
 * Test app helper — creates an Express app wired up with all routes
 * but WITHOUT starting the HTTP server or connecting to MongoDB.
 *
 * The test setup.js handles the MongoDB connection via mongodb-memory-server.
 * Using this helper keeps server.js untouched (no existing code modified).
 */
import express from "express";
import cors from "cors";
import authRoutes from "../routes/authRoutes.js";
import donorRoutes from "../routes/donorRoutes.js";
import adminRoutes from "../routes/adminRoutes.js";
import facilityRoutes from "../routes/facilityRoutes.js";
import bloodLabRoutes from "../routes/bloodLabRoutes.js";
import hospitalRoutes from "../routes/hospitalRoutes.js";
import { swaggerUi, swaggerDocs } from "../openapi/index.js";

export function createTestApp() {
  const app = express();

  app.use(express.json());
  app.use(cors());

  // Swagger (optional — mount anyway to confirm it doesn't crash)
  app.use("/api/doc", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

  // Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/donor", donorRoutes);
  app.use("/api/facility", facilityRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/blood-lab", bloodLabRoutes);
  app.use("/api/hospital", hospitalRoutes);

  return app;
}
