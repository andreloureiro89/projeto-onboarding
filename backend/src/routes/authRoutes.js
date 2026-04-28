const express = require("express");
const { authRequired } = require("../middleware/auth");
const { requiredEmail, requiredString, oneOf } = require("../utils/validators");

function buildAuthRoutes(authService) {
  const router = express.Router();

  router.post("/auth/register", (req, res, next) => {
    try {
      const name = requiredString(req.body.name, "name");
      const email = requiredEmail(req.body.email);
      const password = requiredString(req.body.password, "password");
      const role = req.body.role ? oneOf(req.body.role, "role", ["admin", "user"]) : "user";

      const session = authService.register({ name, email, password, role });
      res.status(201).json(session);
    } catch (err) {
      next(err);
    }
  });

  router.post("/auth/login", (req, res, next) => {
    try {
      const email = requiredEmail(req.body.email);
      const password = requiredString(req.body.password, "password");
      const session = authService.login({ email, password });
      res.json(session);
    } catch (err) {
      next(err);
    }
  });

  router.get("/auth/me", authRequired, (req, res, next) => {
    try {
      const user = authService.me(req.auth.sub);
      res.json(user);
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = { buildAuthRoutes };
