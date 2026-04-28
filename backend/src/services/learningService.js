const { httpError } = require("../utils/httpError");

class LearningService {
  constructor(db) {
    this.db = db;
  }

  getCompany() {
    return this.db.getCompany();
  }

  listModulesForUser(userId) {
    const modules = this.db.listModules().filter((m) => m.active);
    const progress = this.db.listProgressByUser(userId);

    const byModule = new Map(progress.map((p) => [p.moduleId, p]));

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

  getModuleDetail(moduleId, userId) {
    const module = this.db.getModule(moduleId);
    if (!module) {
      throw httpError(404, "module not found");
    }

    const contents = this.db.listContentByModule(moduleId);
    const quiz = this.db.getQuizByModule(moduleId);
    const progress = this.db.getProgress(userId, moduleId) || {
      moduleId,
      completionPercent: 0,
      status: "in_progress",
    };

    // Decorate contents with completion status
    const completions = this.db.getContentCompletions(userId, moduleId);
    const completedContentIds = new Set(completions.map((cc) => cc.contentId));
    const decoratedContents = contents.map((c) => ({
      ...c,
      completed: completedContentIds.has(c.id),
    }));

    return {
      module,
      contents: decoratedContents,
      quiz: quiz ? { ...quiz, questions: this.withoutCorrectAnswer(this.db.listQuestionsByQuiz(quiz.id)) } : null,
      progress,
    };
  }

  getQuiz(quizId) {
    const quiz = this.db.getQuizById(quizId);
    if (!quiz) {
      throw httpError(404, "quiz not found");
    }

    return {
      ...quiz,
      questions: this.withoutCorrectAnswer(this.db.listQuestionsByQuiz(quizId)),
    };
  }

  markContentComplete(userId, contentId) {
    const content = this.db.getContentById(contentId);
    if (!content) {
      throw httpError(404, "content not found");
    }
    this.db.markContentComplete(userId, contentId, content.moduleId);
    const progress = this.recalculateProgress(userId, content.moduleId);
    return { contentId, completed: true, progress };
  }

  recalculateProgress(userId, moduleId) {
    const contents = this.db.listContentByModule(moduleId);
    const quiz = this.db.getQuizByModule(moduleId);

    const requiredContents = contents.filter((c) => c.required);
    const completions = this.db.getContentCompletions(userId, moduleId);
    const completedContentIds = new Set(completions.map((cc) => cc.contentId));

    let totalRequired = requiredContents.length;
    let totalDone = 0;

    for (const c of requiredContents) {
      if (completedContentIds.has(c.id)) totalDone += 1;
    }

    // If quiz exists and is required, it counts as a required item
    let quizPassed = false;
    if (quiz && quiz.required) {
      totalRequired += 1;
      const currentProgress = this.db.getProgress(userId, moduleId);
      if (currentProgress && currentProgress.quizScore >= 70) {
        quizPassed = true;
        totalDone += 1;
      }
    }

    const completionPercent = totalRequired > 0 ? Math.round((totalDone / totalRequired) * 100) : 100;
    const status = completionPercent === 100 ? "completed" : "in_progress";

    return this.db.upsertProgress({
      userId,
      moduleId,
      completionPercent,
      status,
    });
  }

  submitQuiz({ userId, quizId, answers }) {
    const quiz = this.db.getQuizById(quizId);
    if (!quiz) {
      throw httpError(404, "quiz not found");
    }

    const questions = this.db.listQuestionsByQuiz(quizId);
    if (questions.length === 0) {
      throw httpError(400, "quiz has no questions");
    }

    let correct = 0;
    const questionResults = [];
    for (const question of questions) {
      const selected = answers[question.id];
      const isCorrect = selected === question.correctAnswer;
      if (isCorrect) {
        correct += 1;
      }
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

    this.db.addAttempt({ userId, quizId, answers, score });

    // Store quiz score in progress first so recalculateProgress can read it
    this.db.upsertProgress({
      userId,
      moduleId: quiz.moduleId,
      quizScore: score,
    });

    const progress = this.recalculateProgress(userId, quiz.moduleId);

    return {
      score,
      correct,
      total,
      passed: score >= 70,
      questions: questionResults,
      progress,
    };
  }

  getMyProgress(userId) {
    const modules = this.db.listModules().filter((m) => m.active);
    const progress = this.db.listProgressByUser(userId);
    const byModule = new Map(progress.map((p) => [p.moduleId, p]));

    const modulesProgress = modules.map((module) => {
      return byModule.get(module.id) || {
        moduleId: module.id,
        completionPercent: 0,
        status: "in_progress",
      };
    });

    const totalPercentage = modulesProgress.reduce((acc, p) => acc + p.completionPercent, 0);
    const globalPercent = modules.length > 0 ? Math.round(totalPercentage / modules.length) : 0;

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
