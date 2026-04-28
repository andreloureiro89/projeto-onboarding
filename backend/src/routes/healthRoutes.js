const express = require("express");

function buildHealthRoutes() {
  const router = express.Router();

  router.get("/health", (_req, res) => {
    res.json({ ok: true, service: "onboarding-api", timestamp: new Date().toISOString() });
  });

  return router;
}

module.exports = { buildHealthRoutes };
