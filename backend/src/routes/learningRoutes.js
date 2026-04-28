const express = require("express");
const { authRequired } = require("../middleware/auth");

function buildLearningRoutes(learningService) {
  const router = express.Router();

  router.get("/company", authRequired, (req, res, next) => {
    try {
      res.json(learningService.getCompany());
    } catch (err) {
      next(err);
    }
  });

  router.get("/modules", authRequired, (req, res, next) => {
    try {
      res.json(learningService.listModulesForUser(req.auth.sub));
    } catch (err) {
      next(err);
    }
  });

  router.get("/modules/:id", authRequired, (req, res, next) => {
    try {
      res.json(learningService.getModuleDetail(req.params.id, req.auth.sub));
    } catch (err) {
      next(err);
    }
  });

  router.get("/quizzes/:id", authRequired, (req, res, next) => {
    try {
      res.json(learningService.getQuiz(req.params.id));
    } catch (err) {
      next(err);
    }
  });

  router.post("/quizzes/:id/submit", authRequired, (req, res, next) => {
    try {
      const answers = req.body.answers && typeof req.body.answers === "object" ? req.body.answers : {};
      res.json(learningService.submitQuiz({ userId: req.auth.sub, quizId: req.params.id, answers }));
    } catch (err) {
      next(err);
    }
  });

  router.post("/contents/:id/complete", authRequired, (req, res, next) => {
    try {
      res.json(learningService.markContentComplete(req.auth.sub, req.params.id));
    } catch (err) {
      next(err);
    }
  });

  router.get("/progress/me", authRequired, (req, res, next) => {
    try {
      res.json(learningService.getMyProgress(req.auth.sub));
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = { buildLearningRoutes };
