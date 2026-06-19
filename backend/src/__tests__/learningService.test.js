const { LearningService } = require('../services/learningService');

describe('LearningService', () => {
  function createFakeDb() {
    const modules = [
      {
        id: 'm1',
        title: 'Welcome',
        description: 'First module',
        order: 1,
        active: true,
      },
      {
        id: 'm2',
        title: 'Tools',
        description: 'Second module',
        order: 2,
        active: true,
      },
    ];

    const contents = [
      {
        id: 'c1',
        moduleId: 'm1',
        title: 'Intro',
        type: 'text',
        contentOrUrl: 'Welcome content',
        order: 1,
        required: true,
      },
      {
        id: 'c2',
        moduleId: 'm1',
        title: 'Optional Video',
        type: 'video',
        contentOrUrl: 'https://example.com/video',
        order: 2,
        required: false,
      },
    ];

    const quiz = {
      id: 'q1',
      moduleId: 'm1',
      title: 'Welcome Quiz',
      required: true,
      active: true,
    };

    const questions = [
      {
        id: 'question1',
        quizId: 'q1',
        text: 'Question 1',
        options: ['A', 'B'],
        correctAnswer: 1,
        explanation: 'B is correct',
      },
    ];

    let progress = [];

    return {
      getCompany: jest.fn(() => ({
        name: 'NovaTech Solutions',
        tagline: 'Building tomorrow',
        logo: '',
      })),

      listModules: jest.fn(async () => modules),

      listProgressByUser: jest.fn(async () => progress),

      getModule: jest.fn(async (moduleId) => {
        return modules.find((m) => m.id === moduleId) || null;
      }),

      listContentByModule: jest.fn(async (moduleId) => {
        return contents.filter((c) => c.moduleId === moduleId);
      }),

      getQuizByModule: jest.fn(async (moduleId) => {
        return quiz.moduleId === moduleId ? quiz : null;
      }),

      getProgress: jest.fn(async (userId, moduleId) => {
        return progress.find((p) => p.userId === userId && p.moduleId === moduleId) || null;
      }),

      getContentCompletions: jest.fn(async () => []),

      listQuestionsByQuiz: jest.fn(async (quizId) => {
        return questions.filter((q) => q.quizId === quizId);
      }),

      getQuizById: jest.fn(async (quizId) => {
        return quiz.id === quizId ? quiz : null;
      }),

      getContentById: jest.fn(async (contentId) => {
        return contents.find((c) => c.id === contentId) || null;
      }),

      markContentComplete: jest.fn(async () => true),

      upsertProgress: jest.fn(async (payload) => {
        const existingIndex = progress.findIndex(
          (p) => p.userId === payload.userId && p.moduleId === payload.moduleId
        );

        if (existingIndex >= 0) {
          progress[existingIndex] = {
            ...progress[existingIndex],
            ...payload,
          };
          return progress[existingIndex];
        }

        const created = {
          ...payload,
        };

        progress.push(created);
        return created;
      }),

      addAttempt: jest.fn(async () => true),
    };
  }

  it('should return company information', () => {
    const db = createFakeDb();
    const service = new LearningService(db);

    const company = service.getCompany();

    expect(company.name).toBe('NovaTech Solutions');
  });

  it('should list modules with lock state', async () => {
    const db = createFakeDb();
    const service = new LearningService(db);

    const result = await service.listModulesForUser('u1');

    expect(result.length).toBe(2);
    expect(result[0].locked).toBe(false);
    expect(result[1].locked).toBe(true);
  });

  it('should return module detail without correct answers', async () => {
    const db = createFakeDb();
    const service = new LearningService(db);

    const detail = await service.getModuleDetail('m1', 'u1');

    expect(detail.module.id).toBe('m1');
    expect(detail.contents.length).toBe(2);
    expect(detail.quiz.questions[0].correctAnswer).toBeUndefined();
    expect(detail.quiz.questions[0].explanation).toBeUndefined();
  });

  it('should throw error when module does not exist', async () => {
    const db = createFakeDb();
    const service = new LearningService(db);

    await expect(service.getModuleDetail('invalid', 'u1')).rejects.toThrow('module not found');
  });

  it('should return quiz without correct answers', async () => {
    const db = createFakeDb();
    const service = new LearningService(db);

    const result = await service.getQuiz('q1');

    expect(result.id).toBe('q1');
    expect(result.questions[0].correctAnswer).toBeUndefined();
    expect(result.questions[0].explanation).toBeUndefined();
  });

  it('should throw error when quiz does not exist', async () => {
    const db = createFakeDb();
    const service = new LearningService(db);

    await expect(service.getQuiz('invalid')).rejects.toThrow('quiz not found');
  });

  it('should submit quiz and calculate score', async () => {
    const db = createFakeDb();
    const service = new LearningService(db);

    const result = await service.submitQuiz({
      userId: 'u1',
      quizId: 'q1',
      answers: {
        question1: 1,
      },
    });

    expect(result.score).toBe(100);
    expect(result.passed).toBe(true);
    expect(result.correct).toBe(1);
    expect(result.total).toBe(1);
  });

  it('should throw error when submitting invalid quiz', async () => {
    const db = createFakeDb();
    const service = new LearningService(db);

    await expect(
      service.submitQuiz({
        userId: 'u1',
        quizId: 'invalid',
        answers: {},
      })
    ).rejects.toThrow('quiz not found');
  });

  it('should mark content as complete', async () => {
    const db = createFakeDb();
    const service = new LearningService(db);

    const result = await service.markContentComplete('u1', 'c1');

    expect(result.contentId).toBe('c1');
    expect(result.completed).toBe(true);
  });

  it('should return user progress summary', async () => {
    const db = createFakeDb();
    const service = new LearningService(db);

    const result = await service.getMyProgress('u1');

    expect(result.globalPercent).toBe(0);
    expect(result.modules.length).toBe(2);
  });
});