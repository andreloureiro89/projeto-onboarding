const User = require("../models/User");
const Module = require("../models/Module");
const Content = require("../models/Content");
const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const Progress = require("../models/Progress");
const Attempt = require("../models/Attempt");
const ContentCompletion = require("../models/ContentCompletion");

function normalize(doc) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  return { ...obj, id: obj._id.toString() };
}

function normalizeMany(docs) {
  return docs.map(normalize);
}

class MongoDb {
  getCompany() {
    return {
      name: "NovaTech Solutions",
      tagline: "Building tomorrow's digital infrastructure",
      logo: "https://ui-avatars.com/api/?name=NT&background=6366f1&color=fff&size=128&bold=true&font-size=0.4"
    };
  }

  async findUserByEmail(email) {
    return User.findOne({ email: email.toLowerCase() });
  }

  async getUserById(id) {
    return User.findById(id);
  }

  async createUser(payload) {
    const exists = await User.findOne({ email: payload.email.toLowerCase() });
    if (exists) throw new Error("email already exists");

    return User.create({
      name: payload.name,
      email: payload.email.toLowerCase(),
      passwordHash: payload.passwordHash,
      role: payload.role
    });
  }

  async listUsers() {
    const users = await User.find().select("-passwordHash").lean();
    return normalizeMany(users);
  }

  async listModules() {
    const modules = await Module.find().sort({ order: 1 }).lean();
    return normalizeMany(modules);
  }

  async getModule(moduleId) {
    const module = await Module.findById(moduleId).lean();
    return normalize(module);
  }

  async listContentByModule(moduleId) {
    const contents = await Content.find({ moduleId }).sort({ order: 1 }).lean();
    return normalizeMany(contents);
  }

  async getContentById(contentId) {
    const content = await Content.findById(contentId).lean();
    return normalize(content);
  }

  async getQuizByModule(moduleId) {
    const quiz = await Quiz.findOne({ moduleId, active: true }).lean();
    return normalize(quiz);
  }

  async getQuizById(quizId) {
    const quiz = await Quiz.findById(quizId).lean();
    return normalize(quiz);
  }

  async listQuestionsByQuiz(quizId) {
    const questions = await Question.find({ quizId }).lean();
    return normalizeMany(questions);
  }

  async listProgressByUser(userId) {
    const progress = await Progress.find({ userId }).lean();
    return normalizeMany(progress);
  }

  async getProgress(userId, moduleId) {
    const progress = await Progress.findOne({ userId, moduleId }).lean();
    return normalize(progress);
  }

  async upsertProgress(record) {
    const progress = await Progress.findOneAndUpdate(
      { userId: record.userId, moduleId: record.moduleId },
      { $set: record },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    return normalize(progress);
  }

  async addAttempt(attempt) {
    const created = await Attempt.create(attempt);
    return normalize(created);
  }

  async getContentCompletions(userId, moduleId) {
    const completions = await ContentCompletion.find({ userId, moduleId }).lean();
    return normalizeMany(completions);
  }

  async isContentComplete(userId, contentId) {
    return ContentCompletion.exists({ userId, contentId });
  }

  async markContentComplete(userId, contentId, moduleId) {
    const completion = await ContentCompletion.findOneAndUpdate(
      { userId, contentId },
      { $setOnInsert: { userId, contentId, moduleId } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    return normalize(completion);
  }

    async updateUser(userId, payload) {
    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: payload },
      { new: true }
    ).select("-passwordHash").lean();

    return normalize(updated);
  }

  async createModule(payload) {
    const created = await Module.create({
      title: payload.title,
      description: payload.description,
      order: payload.order,
      active: true,
    });

    return normalize(created);
  }

  async updateModule(moduleId, payload) {
    const updated = await Module.findByIdAndUpdate(
      moduleId,
      { $set: payload },
      { new: true }
    ).lean();

    return normalize(updated);
  }

  async deleteModule(moduleId) {
    await Content.deleteMany({ moduleId });

    const quizzes = await Quiz.find({ moduleId }).lean();
    const quizIds = quizzes.map((q) => q._id);

    await Question.deleteMany({ quizId: { $in: quizIds } });
    await Quiz.deleteMany({ moduleId });
    await Progress.deleteMany({ moduleId });
    await ContentCompletion.deleteMany({ moduleId });
    await Module.findByIdAndDelete(moduleId);
  }

  async createContent(payload) {
    const created = await Content.create({
      moduleId: payload.moduleId,
      title: payload.title,
      type: payload.type,
      contentOrUrl: payload.contentOrUrl,
      order: payload.order,
      required: payload.required ?? true,
    });

    return normalize(created);
  }

  async updateContent(contentId, payload) {
    const updated = await Content.findByIdAndUpdate(
      contentId,
      { $set: payload },
      { new: true }
    ).lean();

    return normalize(updated);
  }

  async deleteContent(contentId) {
    await ContentCompletion.deleteMany({ contentId });
    await Content.findByIdAndDelete(contentId);
  }

  async createQuiz(payload) {
    const created = await Quiz.create({
      moduleId: payload.moduleId,
      title: payload.title,
      active: true,
      required: payload.required ?? true,
    });

    return normalize(created);
  }

  async updateQuiz(quizId, payload) {
    const updated = await Quiz.findByIdAndUpdate(
      quizId,
      { $set: payload },
      { new: true }
    ).lean();

    return normalize(updated);
  }

  async deleteQuiz(quizId) {
    await Question.deleteMany({ quizId });
    await Attempt.deleteMany({ quizId });
    await Quiz.findByIdAndDelete(quizId);
  }

  async createQuestion(payload) {
    const created = await Question.create({
      quizId: payload.quizId,
      text: payload.text,
      options: payload.options,
      correctAnswer: payload.correctAnswer,
      explanation: payload.explanation || "",
    });

    return normalize(created);
  }

  async updateQuestion(questionId, payload) {
    const updated = await Question.findByIdAndUpdate(
      questionId,
      { $set: payload },
      { new: true }
    ).lean();

    return normalize(updated);
  }

  async deleteQuestion(questionId) {
    await Question.findByIdAndDelete(questionId);
  }

  async reset() {
    const { execFile } = require("child_process");
    const path = require("path");

    return new Promise((resolve, reject) => {
      const scriptPath = path.join(__dirname, "../data/seedMongo.js");

      execFile("node", [scriptPath], (error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(true);
      });
    });
  }


}

module.exports = { MongoDb };