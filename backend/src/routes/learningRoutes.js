const express = require("express");
const { authRequired } = require("../middleware/auth");

function buildLearningRoutes(learningService) {
  const router = express.Router();

  router.get("/company", authRequired, async (req, res, next) => {
    try {
      const company = await learningService.getCompany();
      res.json(company);
    } catch (err) {
      next(err);
    }
  });

  router.get("/modules", authRequired, async (req, res, next) => {
    try {
      const modules = await learningService.listModulesForUser(req.auth.sub);
      res.json(modules);
    } catch (err) {
      next(err);
    }
  });

  router.get("/modules/:id", authRequired, async (req, res, next) => {
    try {
      const module = await learningService.getModuleDetail(
        req.params.id,
        req.auth.sub
      );

      res.json(module);
    } catch (err) {
      next(err);
    }
  });

  router.get("/quizzes/:id", authRequired, async (req, res, next) => {
    try {
      const quiz = await learningService.getQuiz(req.params.id);
      res.json(quiz);
    } catch (err) {
      next(err);
    }
  });

  router.post("/quizzes/:id/submit", authRequired, async (req, res, next) => {
    try {
      const answers =
        req.body.answers && typeof req.body.answers === "object"
          ? req.body.answers
          : {};

      const result = await learningService.submitQuiz({
        userId: req.auth.sub,
        quizId: req.params.id,
        answers,
      });

      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  router.post("/contents/:id/complete", authRequired, async (req, res, next) => {
    try {
      const result = await learningService.markContentComplete(
        req.auth.sub,
        req.params.id
      );

      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  router.get("/progress/me", authRequired, async (req, res, next) => {
    try {
      const progress = await learningService.getMyProgress(req.auth.sub);
      res.json(progress);
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = { buildLearningRoutes };