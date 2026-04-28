const express = require("express");
const cors = require("cors");
const env = require("./config/env");
const { errorHandler } = require("./middleware/errorHandler");
const { buildHealthRoutes } = require("./routes/healthRoutes");
const { buildAuthRoutes } = require("./routes/authRoutes");
const { buildLearningRoutes } = require("./routes/learningRoutes");
const { buildAdminRoutes } = require("./routes/adminRoutes");
const { MockDb } = require("./repositories/mockDb");
const { AuthService } = require("./services/authService");
const { LearningService } = require("./services/learningService");

function buildApp() {
  const app = express();
  const db = new MockDb();
  const authService = new AuthService(db);
  const learningService = new LearningService(db);

  app.use(cors({
    origin: "http://localhost:4200",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }));
  app.use(express.json());

  app.use("/api", buildHealthRoutes());
  app.use("/api", buildAuthRoutes(authService));
  app.use("/api", buildLearningRoutes(learningService));
  app.use("/api", buildAdminRoutes(db, learningService));

  app.use(errorHandler);

  return { app, db };
}

module.exports = { buildApp };
