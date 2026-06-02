require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const env = require("../config/env");
const { createSeedData } = require("./seed");

const User = require("../models/User");
const Module = require("../models/Module");
const Content = require("../models/Content");
const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const Progress = require("../models/Progress");
const Attempt = require("../models/Attempt");
const ContentCompletion = require("../models/ContentCompletion");

async function seedMongo() {
  await mongoose.connect(env.mongoUri);

  console.log("MongoDB connected");

  await Promise.all([
    User.deleteMany({}),
    Module.deleteMany({}),
    Content.deleteMany({}),
    Quiz.deleteMany({}),
    Question.deleteMany({}),
    Progress.deleteMany({}),
    Attempt.deleteMany({}),
    ContentCompletion.deleteMany({})
  ]);

  const passwordHashAdmin = await bcrypt.hash("admin123", 10);
  const passwordHashUser = await bcrypt.hash("user123", 10);

  const data = createSeedData(passwordHashAdmin, passwordHashUser);

  const moduleMap = new Map();
  const quizMap = new Map();

  for (const user of data.users) {
    await User.create({
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
      active: user.active
    });
  }

  for (const moduleData of data.modules) {
    const created = await Module.create({
      title: moduleData.title,
      description: moduleData.description,
      order: moduleData.order,
      active: moduleData.active
    });

    moduleMap.set(moduleData.id, created._id);
  }

  for (const content of data.contents) {
    await Content.create({
      moduleId: moduleMap.get(content.moduleId),
      title: content.title,
      type: content.type,
      contentOrUrl: content.contentOrUrl,
      order: content.order,
      required: content.required
    });
  }

  for (const quiz of data.quizzes) {
    const created = await Quiz.create({
      moduleId: moduleMap.get(quiz.moduleId),
      title: quiz.title,
      active: quiz.active,
      required: quiz.required
    });

    quizMap.set(quiz.id, created._id);
  }

  for (const question of data.questions) {
    await Question.create({
      quizId: quizMap.get(question.quizId),
      text: question.text,
      options: question.options,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation
    });
  }

  console.log("MongoDB seed completed");
  await mongoose.disconnect();
}

seedMongo().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});