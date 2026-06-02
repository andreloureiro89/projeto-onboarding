const { httpError } = require("../utils/httpError");

class LearningService {
  constructor(db) {
    this.db = db;
  }

  getCompany() {
    return this.db.getCompany();
  }

  async listModulesForUser(userId) {
    const modules = (await this.db.listModules()).filter((m) => m.active);
    const progress = await this.db.listProgressByUser(userId);

    const byModule = new Map(progress.map((p) => [p.moduleId.toString(), p]));

    return modules.map((module, index) => {
      const prevModule = modules[index - 1];
      const prevProgress = prevModule ? byModule.get(prevModule.id) : null;
      const locked = prevModule ? prevProgress?.status !== "completed" : false;
      const p = byModule.get(module.id);

      return {
        ...module,
        locked,
        progress: p || {
          moduleId: module.id,
          completionPercent: 0,
          status: "in_progress",
        },
      };
    });
  }

  async getModuleDetail(moduleId, userId) {
    const module = await this.db.getModule(moduleId);
    if (!module) throw httpError(404, "module not found");

    const contents = await this.db.listContentByModule(moduleId);
    const quiz = await this.db.getQuizByModule(moduleId);

    const progress = (await this.db.getProgress(userId, moduleId)) || {
      moduleId,
      completionPercent: 0,
      status: "in_progress",
    };

    const completions = await this.db.getContentCompletions(userId, moduleId);
    const completedContentIds = new Set(
      completions.map((cc) => cc.contentId.toString())
    );

    const decoratedContents = contents.map((c) => ({
      ...c,
      completed: completedContentIds.has(c.id),
    }));

    const questions = quiz
      ? await this.db.listQuestionsByQuiz(quiz.id)
      : [];

    return {
      module,
      contents: decoratedContents,
      quiz: quiz
        ? { ...quiz, questions: this.withoutCorrectAnswer(questions) }
        : null,
      progress,
    };
  }

  async getQuiz(quizId) {
    const quiz = await this.db.getQuizById(quizId);
    if (!quiz) throw httpError(404, "quiz not found");

    const questions = await this.db.listQuestionsByQuiz(quizId);

    return {
      ...quiz,
      questions: this.withoutCorrectAnswer(questions),
    };
  }

  async markContentComplete(userId, contentId) {
    const content = await this.db.getContentById(contentId);
    if (!content) throw httpError(404, "content not found");

    await this.db.markContentComplete(userId, contentId, content.moduleId);

    const progress = await this.recalculateProgress(userId, content.moduleId);

    return {
      contentId,
      completed: true,
      progress,
    };
  }

  async recalculateProgress(userId, moduleId) {
    const contents = await this.db.listContentByModule(moduleId);
    const quiz = await this.db.getQuizByModule(moduleId);

    const requiredContents = contents.filter((c) => c.required);
    const completions = await this.db.getContentCompletions(userId, moduleId);

    const completedContentIds = new Set(
      completions.map((cc) => cc.contentId.toString())
    );

    let totalRequired = requiredContents.length;
    let totalDone = 0;

    for (const content of requiredContents) {
      if (completedContentIds.has(content.id)) {
        totalDone += 1;
      }
    }

    if (quiz && quiz.required) {
      totalRequired += 1;

      const currentProgress = await this.db.getProgress(userId, moduleId);

      if (currentProgress && currentProgress.quizScore >= 70) {
        totalDone += 1;
      }
    }

    const completionPercent =
      totalRequired > 0
        ? Math.round((totalDone / totalRequired) * 100)
        : 100;

    const status =
      completionPercent === 100 ? "completed" : "in_progress";

    return this.db.upsertProgress({
      userId,
      moduleId,
      completionPercent,
      status,
    });
  }

  async submitQuiz({ userId, quizId, answers }) {
    const quiz = await this.db.getQuizById(quizId);
    if (!quiz) throw httpError(404, "quiz not found");

    const questions = await this.db.listQuestionsByQuiz(quizId);
    if (questions.length === 0) {
      throw httpError(400, "quiz has no questions");
    }

    let correct = 0;
    const questionResults = [];

    for (const question of questions) {
      const selected = answers[question.id];
      const isCorrect = selected === question.correctAnswer;

      if (isCorrect) correct += 1;

      questionResults.push({
        questionId: question.id,
        text: question.text,
        options: question.options,
        selectedAnswer: selected ?? null,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation,
      });
    }

    const total = questions.length;
    const score = Math.round((correct / total) * 100);

    await this.db.addAttempt({
      userId,
      quizId,
      answers,
      score,
    });

    await this.db.upsertProgress({
      userId,
      moduleId: quiz.moduleId,
      quizScore: score,
    });

    const progress = await this.recalculateProgress(userId, quiz.moduleId);

    return {
      score,
      correct,
      total,
      passed: score >= 70,
      questions: questionResults,
      progress,
    };
  }

  async getMyProgress(userId) {
    const modules = (await this.db.listModules()).filter((m) => m.active);
    const progress = await this.db.listProgressByUser(userId);

    const byModule = new Map(
      progress.map((p) => [p.moduleId.toString(), p])
    );

    const modulesProgress = modules.map((module) => {
      return byModule.get(module.id) || {
        moduleId: module.id,
        completionPercent: 0,
        status: "in_progress",
      };
    });

    const totalPercentage = modulesProgress.reduce(
      (acc, p) => acc + p.completionPercent,
      0
    );

    const globalPercent =
      modules.length > 0
        ? Math.round(totalPercentage / modules.length)
        : 0;

    return {
      globalPercent,
      modules: modulesProgress,
    };
  }

  withoutCorrectAnswer(questions) {
    return questions.map(({ correctAnswer, explanation, ...q }) => q);
  }
}

module.exports = { LearningService };