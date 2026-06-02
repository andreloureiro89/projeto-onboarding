const express = require("express");
const { authRequired, roleRequired } = require("../middleware/auth");
const { requiredString } = require("../utils/validators");

function buildAdminRoutes(db, learningService) {
  const router = express.Router();
  router.use(authRequired, roleRequired("admin"));

  router.get("/admin/users", async (_req, res, next) => {
    try {
      res.json(await db.listUsers());
    } catch (err) {
      next(err);
    }
  });

  router.put("/admin/users/:id", async (req, res, next) => {
    try {
      res.json(await db.updateUser(req.params.id, req.body || {}));
    } catch (err) {
      next(err);
    }
  });

  router.get("/admin/users/:id/progress", async (req, res, next) => {
    try {
      const user = await db.getUserById(req.params.id);
      if (!user) return res.status(404).json({ error: "user not found" });

      const progress = await learningService.getMyProgress(req.params.id);
      const obj = user.toObject ? user.toObject() : user;
      const { passwordHash, ...safeUser } = obj;

      res.json({
        user: { ...safeUser, id: safeUser._id.toString() },
        progress,
      });
    } catch (err) {
      next(err);
    }
  });

  router.get("/admin/progress", async (_req, res, next) => {
    try {
      const users = await db.listUsers();
      const modules = (await db.listModules()).filter((m) => m.active);

      const result = [];

      for (const user of users) {
        const userProgress = await db.listProgressByUser(user.id);
        const byModule = new Map(
          userProgress.map((p) => [p.moduleId.toString(), p])
        );

        const modulesProgress = modules.map((m) => {
          return byModule.get(m.id) || {
            moduleId: m.id,
            completionPercent: 0,
            status: "in_progress",
          };
        });

        const total = modulesProgress.reduce(
          (s, p) => s + p.completionPercent,
          0
        );

        const globalPercent =
          modules.length > 0 ? Math.round(total / modules.length) : 0;

        result.push({
          user,
          globalPercent,
          modules: modulesProgress,
        });
      }

      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  router.post("/admin/modules", async (req, res, next) => {
    try {
      const title = requiredString(req.body.title, "title");
      const description = requiredString(req.body.description, "description");
      const order = Number(req.body.order || 1);

      const created = await db.createModule({
        title,
        description,
        order,
      });

      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  });

  router.put("/admin/modules/:id", async (req, res, next) => {
    try {
      res.json(await db.updateModule(req.params.id, req.body || {}));
    } catch (err) {
      next(err);
    }
  });

  router.delete("/admin/modules/:id", async (req, res, next) => {
    try {
      await db.deleteModule(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  router.get("/admin/modules/:id/contents", async (req, res, next) => {
    try {
      res.json(await db.listContentByModule(req.params.id));
    } catch (err) {
      next(err);
    }
  });

  router.post("/admin/modules/:id/contents", async (req, res, next) => {
    try {
      const title = requiredString(req.body.title, "title");
      const type = requiredString(req.body.type, "type");
      const contentOrUrl = requiredString(req.body.contentOrUrl, "contentOrUrl");
      const order = Number(req.body.order || 1);

      const created = await db.createContent({
        moduleId: req.params.id,
        title,
        type,
        contentOrUrl,
        order,
        required: req.body.required,
      });

      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  });

  router.put("/admin/contents/:id", async (req, res, next) => {
    try {
      res.json(await db.updateContent(req.params.id, req.body || {}));
    } catch (err) {
      next(err);
    }
  });

  router.delete("/admin/contents/:id", async (req, res, next) => {
    try {
      await db.deleteContent(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  router.get("/admin/modules/:id/quiz", async (req, res, next) => {
    try {
      const quiz = await db.getQuizByModule(req.params.id);
      if (!quiz) return res.json(null);

      const questions = await db.listQuestionsByQuiz(quiz.id);
      res.json({ ...quiz, questions });
    } catch (err) {
      next(err);
    }
  });

  router.post("/admin/modules/:id/quiz", async (req, res, next) => {
    try {
      const title = requiredString(req.body.title, "title");
      const required = req.body.required !== false;

      const created = await db.createQuiz({
        moduleId: req.params.id,
        title,
        required,
      });

      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  });

  router.put("/admin/quizzes/:id", async (req, res, next) => {
    try {
      res.json(await db.updateQuiz(req.params.id, req.body || {}));
    } catch (err) {
      next(err);
    }
  });

  router.delete("/admin/quizzes/:id", async (req, res, next) => {
    try {
      await db.deleteQuiz(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  router.post("/admin/quizzes/:id/questions", async (req, res, next) => {
    try {
      const text = requiredString(req.body.text, "text");

      if (!Array.isArray(req.body.options) || req.body.options.length < 2) {
        return res.status(400).json({ error: "at least 2 options required" });
      }

      const correctAnswer = Number(req.body.correctAnswer ?? 0);

      const created = await db.createQuestion({
        quizId: req.params.id,
        text,
        options: req.body.options,
        correctAnswer,
        explanation: req.body.explanation || "",
      });

      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  });

  router.put("/admin/questions/:id", async (req, res, next) => {
    try {
      res.json(await db.updateQuestion(req.params.id, req.body || {}));
    } catch (err) {
      next(err);
    }
  });

  router.delete("/admin/questions/:id", async (req, res, next) => {
    try {
      await db.deleteQuestion(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  router.post("/admin/reset", async (_req, res, next) => {
    try {
      await db.reset();
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = { buildAdminRoutes };