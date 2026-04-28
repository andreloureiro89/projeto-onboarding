const express = require("express");
const { authRequired, roleRequired } = require("../middleware/auth");
const { requiredString } = require("../utils/validators");

function buildAdminRoutes(db, learningService) {
  const router = express.Router();
  router.use(authRequired, roleRequired("admin"));

  // ───── Users ─────

  router.get("/admin/users", (_req, res) => {
    res.json(db.listUsers());
  });

  router.put("/admin/users/:id", (req, res, next) => {
    try {
      const updated = db.updateUser(req.params.id, req.body || {});
      const { passwordHash, ...safe } = updated;
      res.json(safe);
    } catch (err) { next(err); }
  });

  router.get("/admin/users/:id/progress", (req, res) => {
    const userId = req.params.id;
    const user = db.getUserById(userId);
    if (!user) return res.status(404).json({ error: "user not found" });
    const progress = learningService.getMyProgress(userId);
    const { passwordHash, ...safeUser } = user;
    res.json({ user: safeUser, progress });
  });

  router.get("/admin/progress", (_req, res) => {
    const users = db.listUsers();
    const modules = db.listModules().filter((m) => m.active);
    const result = users.map((user) => {
      const userProgress = db.listProgressByUser(user.id);
      const byModule = new Map(userProgress.map((p) => [p.moduleId, p]));
      const modulesProgress = modules.map((m) => {
        const p = byModule.get(m.id);
        return p || { moduleId: m.id, completionPercent: 0, status: "in_progress" };
      });
      const total = modulesProgress.reduce((s, p) => s + p.completionPercent, 0);
      const globalPercent = modules.length > 0 ? Math.round(total / modules.length) : 0;
      return { user, globalPercent, modules: modulesProgress };
    });
    res.json(result);
  });

  // ───── Modules ─────

  router.post("/admin/modules", (req, res, next) => {
    try {
      const title = requiredString(req.body.title, "title");
      const description = requiredString(req.body.description, "description");
      const order = Number(req.body.order || 1);
      const created = db.createModule({ title, description, order });
      res.status(201).json(created);
    } catch (err) { next(err); }
  });

  router.put("/admin/modules/:id", (req, res, next) => {
    try {
      const updated = db.updateModule(req.params.id, req.body || {});
      res.json(updated);
    } catch (err) { next(err); }
  });

  router.delete("/admin/modules/:id", (req, res) => {
    db.deleteModule(req.params.id);
    res.status(204).send();
  });

  // ───── Contents ─────

  router.get("/admin/modules/:id/contents", (req, res) => {
    res.json(db.listContentByModule(req.params.id));
  });

  router.post("/admin/modules/:id/contents", (req, res, next) => {
    try {
      const title = requiredString(req.body.title, "title");
      const type = requiredString(req.body.type, "type");
      const contentOrUrl = requiredString(req.body.contentOrUrl, "contentOrUrl");
      const order = Number(req.body.order || 1);
      const created = db.createContent({
        moduleId: req.params.id,
        title,
        type,
        contentOrUrl,
        order,
        required: req.body.required,
      });
      res.status(201).json(created);
    } catch (err) { next(err); }
  });

  router.put("/admin/contents/:id", (req, res, next) => {
    try {
      const updated = db.updateContent(req.params.id, req.body || {});
      res.json(updated);
    } catch (err) { next(err); }
  });

  router.delete("/admin/contents/:id", (req, res) => {
    db.deleteContent(req.params.id);
    res.status(204).send();
  });

  // ───── Quizzes ─────

  router.get("/admin/modules/:id/quiz", (req, res) => {
    const quiz = db.getQuizByModule(req.params.id);
    if (!quiz) return res.json(null);
    const questions = db.listQuestionsByQuiz(quiz.id);
    res.json({ ...quiz, questions });
  });

  router.post("/admin/modules/:id/quiz", (req, res, next) => {
    try {
      const title = requiredString(req.body.title, "title");
      const required = req.body.required !== false;
      const created = db.createQuiz({ moduleId: req.params.id, title, required });
      res.status(201).json(created);
    } catch (err) { next(err); }
  });

  router.put("/admin/quizzes/:id", (req, res, next) => {
    try {
      const updated = db.updateQuiz(req.params.id, req.body || {});
      res.json(updated);
    } catch (err) { next(err); }
  });

  router.delete("/admin/quizzes/:id", (req, res) => {
    db.deleteQuiz(req.params.id);
    res.status(204).send();
  });

  // ───── Questions ─────

  router.post("/admin/quizzes/:id/questions", (req, res, next) => {
    try {
      const text = requiredString(req.body.text, "text");
      if (!Array.isArray(req.body.options) || req.body.options.length < 2) {
        return res.status(400).json({ error: "at least 2 options required" });
      }
      const correctAnswer = Number(req.body.correctAnswer ?? 0);
      const created = db.createQuestion({
        quizId: req.params.id,
        text,
        options: req.body.options,
        correctAnswer,
        explanation: req.body.explanation || "",
      });
      res.status(201).json(created);
    } catch (err) { next(err); }
  });

  router.put("/admin/questions/:id", (req, res, next) => {
    try {
      const updated = db.updateQuestion(req.params.id, req.body || {});
      res.json(updated);
    } catch (err) { next(err); }
  });

  router.delete("/admin/questions/:id", (req, res) => {
    db.deleteQuestion(req.params.id);
    res.status(204).send();
  });

  // ───── Reset ─────

  router.post("/admin/reset", (_req, res) => {
    db.reset();
    res.json({ ok: true });
  });

  return router;
}

module.exports = { buildAdminRoutes };
