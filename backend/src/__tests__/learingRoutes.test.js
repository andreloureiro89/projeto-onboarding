const request = require('supertest');
const bcrypt = require('bcryptjs');
const { buildApp } = require('../app');

describe('Learning Routes', () => {
  function createFakeDb() {
    const user = {
      _id: { toString: () => 'u1' },
      id: 'u1',
      name: 'User Test',
      email: 'user@local.test',
      passwordHash: bcrypt.hashSync('user123', 10),
      role: 'user',
      active: true,
    };

    const modules = [
      {
        id: 'm1',
        title: 'Welcome',
        description: 'First module',
        order: 1,
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
    ];

    const quiz = {
      id: 'q1',
      moduleId: 'm1',
      title: 'Welcome Quiz',
      active: true,
      required: true,
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

    return {
      findUserByEmail: jest.fn(async (email) => {
        if (email === 'user@local.test') return user;
        return null;
      }),

      getUserById: jest.fn(async (id) => {
        if (id === 'u1') return user;
        return null;
      }),

      getCompany: jest.fn(() => ({
        name: 'NovaTech Solutions',
        tagline: 'Building tomorrow',
        logo: '',
      })),

      listModules: jest.fn(async () => modules),
      listProgressByUser: jest.fn(async () => []),

      getModule: jest.fn(async (id) => {
        return modules.find((m) => m.id === id) || null;
      }),

      listContentByModule: jest.fn(async (moduleId) => {
        return contents.filter((c) => c.moduleId === moduleId);
      }),

      getQuizByModule: jest.fn(async (moduleId) => {
        return quiz.moduleId === moduleId ? quiz : null;
      }),

      getProgress: jest.fn(async () => null),

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

      upsertProgress: jest.fn(async (payload) => payload),

      addAttempt: jest.fn(async () => true),

      listUsers: jest.fn(async () => []),
    };
  }

  async function login(app) {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@local.test',
        password: 'user123',
      });

    return response.body.token;
  }

  it('should reject company request without token', async () => {
    const db = createFakeDb();
    const { app } = buildApp(db);

    const response = await request(app).get('/api/company');

    expect(response.status).toBe(401);
  });

  it('should return company information', async () => {
    const db = createFakeDb();
    const { app } = buildApp(db);
    const token = await login(app);

    const response = await request(app)
      .get('/api/company')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('NovaTech Solutions');
  });

  it('should list modules for authenticated user', async () => {
    const db = createFakeDb();
    const { app } = buildApp(db);
    const token = await login(app);

    const response = await request(app)
      .get('/api/modules')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].title).toBe('Welcome');
  });

  it('should return module detail', async () => {
    const db = createFakeDb();
    const { app } = buildApp(db);
    const token = await login(app);

    const response = await request(app)
      .get('/api/modules/m1')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.module.id).toBe('m1');
    expect(response.body.contents.length).toBe(1);
  });

  it('should return 404 for invalid module', async () => {
    const db = createFakeDb();
    const { app } = buildApp(db);
    const token = await login(app);

    const response = await request(app)
      .get('/api/modules/invalid')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
  });

  it('should return quiz without correct answers', async () => {
    const db = createFakeDb();
    const { app } = buildApp(db);
    const token = await login(app);

    const response = await request(app)
      .get('/api/quizzes/q1')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe('q1');
    expect(response.body.questions[0].correctAnswer).toBeUndefined();
  });

  it('should submit quiz answers', async () => {
    const db = createFakeDb();
    const { app } = buildApp(db);
    const token = await login(app);

    const response = await request(app)
      .post('/api/quizzes/q1/submit')
      .set('Authorization', `Bearer ${token}`)
      .send({
        answers: {
          question1: 1,
        },
      });

    expect(response.status).toBe(200);
    expect(response.body.score).toBe(100);
    expect(response.body.passed).toBe(true);
  });

  it('should mark content as complete', async () => {
    const db = createFakeDb();
    const { app } = buildApp(db);
    const token = await login(app);

    const response = await request(app)
      .post('/api/contents/c1/complete')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.completed).toBe(true);
  });

  it('should return current user progress', async () => {
    const db = createFakeDb();
    const { app } = buildApp(db);
    const token = await login(app);

    const response = await request(app)
      .get('/api/progress/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.globalPercent).toBe(0);
    expect(response.body.modules.length).toBe(1);
  });
});