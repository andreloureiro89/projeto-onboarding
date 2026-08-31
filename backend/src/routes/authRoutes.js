const express = require("express");
const { authRequired } = require("../middleware/auth");
const {
  requiredEmail,
  requiredString,
  requiredPassword
} = require("../utils/validators");

function buildAuthRoutes(authService) {
  const router = express.Router();

  router.post("/auth/register", async (req, res, next) => {
    try {
      const name = requiredString(req.body.name, "name");
      const email = requiredEmail(req.body.email);
      const password = requiredPassword(req.body.password);

      // Self-registration always creates a regular account. Honouring a
      // role sent in the request body let any anonymous caller create an
      // admin account. Promotion is an administrative operation only
      // (PUT /api/admin/users/:id).
      const session = await authService.register({
        name,
        email,
        password
      });

      res.status(201).json(session);

    } catch (err) {
      next(err);
    }
  });

  router.post("/auth/login", async (req, res, next) => {
    try {

      const email = requiredEmail(req.body.email);
      const password = requiredString(
        req.body.password,
        "password"
      );

      const session = await authService.login({
        email,
        password
      });

      res.json(session);

    } catch (err) {
      next(err);
    }
  });

  router.get(
    "/auth/me",
    authRequired,
    async (req, res, next) => {
      try {

        const user = await authService.me(
          req.auth.sub
        );

        res.json(user);

      } catch (err) {
        next(err);
      }
    }
  );

  return router;
}

module.exports = { buildAuthRoutes };