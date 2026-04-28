const bcrypt = require("bcryptjs");
const { v4: uuid } = require("uuid");
const { createSeedData } = require("../data/seed");
const { httpError } = require("../utils/httpError");

class MockDb {
  constructor() {
    this.reset();
  }

  reset() {
    const passwordHashAdmin = bcrypt.hashSync("admin123", 10);
    const passwordHashUser = bcrypt.hashSync("user123", 10);
    this.data = createSeedData(passwordHashAdmin, passwordHashUser);
  }

  getCompany() {
    return this.data.company || { name: "Company", tagline: "", logo: "" };
  }

  listModules() {
    return [...this.data.modules].sort((a, b) => a.order - b.order);
  }

  getModule(moduleId) {
    return this.data.modules.find((m) => m.id === moduleId) || null;
  }

  listContentByModule(moduleId) {
    return this.data.contents
      .filter((c) => c.moduleId === moduleId)
      .sort((a, b) => a.order - b.order);
  }

  getQuizByModule(moduleId) {
    return this.data.quizzes.find((q) => q.moduleId === moduleId && q.active) || null;
  }

  getQuizById(quizId) {
    return this.data.quizzes.find((q) => q.id === quizId) || null;
  }

  listQuestionsByQuiz(quizId) {
    return this.data.questions.filter((q) => q.quizId === quizId);
  }

  findUserByEmail(email) {
    return this.data.users.find((u) => u.email === email.toLowerCase()) || null;
  }

  getUserById(userId) {
    return this.data.users.find((u) => u.id === userId) || null;
  }

  createUser(payload) {
    if (this.findUserByEmail(payload.email)) {
      throw httpError(409, "email already exists");
    }
    const user = {
      id: uuid(),
      name: payload.name,
      email: payload.email.toLowerCase(),
      passwordHash: payload.passwordHash,
      role: payload.role,
      createdAt: new Date().toISOString(),
      active: true,
    };
    this.data.users.push(user);
    return user;
  }

  listUsers() {
    return this.data.users.map(({ passwordHash, ...user }) => user);
  }

  listProgressByUser(userId) {
    return this.data.progress.filter((p) => p.userId === userId);
  }

  getProgress(userId, moduleId) {
    return this.data.progress.find((p) => p.userId === userId && p.moduleId === moduleId) || null;
  }

  upsertProgress(record) {
    const current = this.getProgress(record.userId, record.moduleId);
    if (current) {
      Object.assign(current, record, { updatedAt: new Date().toISOString() });
      return current;
    }

    const created = {
      id: uuid(),
      ...record,
      updatedAt: new Date().toISOString(),
    };
    this.data.progress.push(created);
    return created;
  }

  addAttempt(attempt) {
    const created = {
      id: uuid(),
      ...attempt,
      submittedAt: new Date().toISOString(),
    };
    this.data.attempts.push(created);
    return created;
  }

  createModule(payload) {
    const module = {
      id: uuid(),
      title: payload.title,
      description: payload.description,
      order: payload.order,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.modules.push(module);
    return module;
  }

  updateModule(moduleId, payload) {
    const module = this.getModule(moduleId);
    if (!module) {
      throw httpError(404, "module not found");
    }
    Object.assign(module, payload, { updatedAt: new Date().toISOString() });
    return module;
  }

  deleteModule(moduleId) {
    this.data.modules = this.data.modules.filter((m) => m.id !== moduleId);
    this.data.contents = this.data.contents.filter((c) => c.moduleId !== moduleId);
    const quizIds = this.data.quizzes.filter((q) => q.moduleId === moduleId).map((q) => q.id);
    this.data.quizzes = this.data.quizzes.filter((q) => q.moduleId !== moduleId);
    this.data.questions = this.data.questions.filter((q) => !quizIds.includes(q.quizId));
    this.data.progress = this.data.progress.filter((p) => p.moduleId !== moduleId);
  }

  // --- Content CRUD ---

  getContentById(contentId) {
    return this.data.contents.find((c) => c.id === contentId) || null;
  }

  createContent(payload) {
    const content = {
      id: uuid(),
      moduleId: payload.moduleId,
      title: payload.title,
      type: payload.type,
      contentOrUrl: payload.contentOrUrl,
      order: payload.order,
      required: payload.required ?? true,
    };
    this.data.contents.push(content);
    return content;
  }

  updateContent(contentId, payload) {
    const content = this.getContentById(contentId);
    if (!content) throw httpError(404, "content not found");
    Object.assign(content, payload);
    return content;
  }

  deleteContent(contentId) {
    this.data.contents = this.data.contents.filter((c) => c.id !== contentId);
  }

  // --- Quiz CRUD ---

  createQuiz(payload) {
    const quiz = {
      id: uuid(),
      moduleId: payload.moduleId,
      title: payload.title,
      active: true,
      required: payload.required ?? true,
    };
    this.data.quizzes.push(quiz);
    return quiz;
  }

  updateQuiz(quizId, payload) {
    const quiz = this.getQuizById(quizId);
    if (!quiz) throw httpError(404, "quiz not found");
    Object.assign(quiz, payload);
    return quiz;
  }

  deleteQuiz(quizId) {
    this.data.quizzes = this.data.quizzes.filter((q) => q.id !== quizId);
    this.data.questions = this.data.questions.filter((q) => q.quizId !== quizId);
  }

  // --- Question CRUD ---

  getQuestionById(questionId) {
    return this.data.questions.find((q) => q.id === questionId) || null;
  }

  createQuestion(payload) {
    const question = {
      id: uuid(),
      quizId: payload.quizId,
      text: payload.text,
      options: payload.options,
      correctAnswer: payload.correctAnswer,
      explanation: payload.explanation || "",
    };
    this.data.questions.push(question);
    return question;
  }

  updateQuestion(questionId, payload) {
    const question = this.getQuestionById(questionId);
    if (!question) throw httpError(404, "question not found");
    Object.assign(question, payload);
    return question;
  }

  deleteQuestion(questionId) {
    this.data.questions = this.data.questions.filter((q) => q.id !== questionId);
  }

  // --- User management ---

  updateUser(userId, payload) {
    const user = this.getUserById(userId);
    if (!user) throw httpError(404, "user not found");
    if (payload.role) user.role = payload.role;
    if (typeof payload.active === "boolean") user.active = payload.active;
    if (payload.name) user.name = payload.name;
    return user;
  }

  // --- All-users progress ---

  listAllProgress() {
    return this.data.progress;
  }

  listAttemptsByUser(userId) {
    return this.data.attempts.filter((a) => a.userId === userId);
  }

  // --- Content completions ---

  getContentCompletions(userId, moduleId) {
    return this.data.contentCompletions.filter(
      (cc) => cc.userId === userId && cc.moduleId === moduleId
    );
  }

  isContentComplete(userId, contentId) {
    return this.data.contentCompletions.some(
      (cc) => cc.userId === userId && cc.contentId === contentId
    );
  }

  markContentComplete(userId, contentId, moduleId) {
    if (this.isContentComplete(userId, contentId)) {
      return this.data.contentCompletions.find(
        (cc) => cc.userId === userId && cc.contentId === contentId
      );
    }
    const record = {
      id: uuid(),
      userId,
      contentId,
      moduleId,
      completedAt: new Date().toISOString(),
    };
    this.data.contentCompletions.push(record);
    return record;
  }
}

module.exports = { MockDb };
