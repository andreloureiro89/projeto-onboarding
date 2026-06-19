const request = require('supertest');
const bcrypt = require('bcryptjs');
const { buildApp } = require('../app');

describe('Admin Routes', () => {
  function createFakeDb() {
    const adminUser = {
      _id: { toString: () => 'admin1' },
      id: 'admin1',
      name: 'Admin Test',
      email: 'admin@local.test',
      passwordHash: bcrypt.hashSync('admin123', 10),
      role: 'admin',
      active: true,
    };

    const normalUser = {
      _id: { toString: () => 'user1' },
      id: 'user1',
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
        contentOrUrl: 'Intro text',
        order: 1,
        required: true,
      },
    ];

    const quiz = {
      id: 'qz1',
      moduleId: 'm1',
      title: 'Welcome Quiz',
      required: true,
      active: true,
    };

    const questions = [
      {
        id: 'q1',
        quizId: 'qz1',
        text: 'Question?',
        options: ['A', 'B'],
        correctAnswer: 0,
        explanation: '',
      },
    ];

    return {
      getCompany: jest.fn(() => ({
        name: 'NovaTech Solutions',
        tagline: 'Building tomorrow',
        logo: '',
      })),

      findUserByEmail: jest.fn(async (email) => {
        if (email === 'admin@local.test') return adminUser;
        if (email === 'user@local.test') return normalUser;
        return null;
      }),

      getUserById: jest.fn(async (id) => {
        if (id === 'admin1') return adminUser;
        if (id === 'user1') return normalUser;
        return null;
      }),

      listUsers: jest.fn(async () => [
        {
          id: 'admin1',
          name: 'Admin Test',
          email: 'admin@local.test',
          role: 'admin',
          active: true,
        },
        {
          id: 'user1',
          name: 'User Test',
          email: 'user@local.test',
          role: 'user',
          active: true,
        },
      ]),

      updateUser: jest.fn(async (id, payload) => ({
        id,
        name: 'Updated User',
        email: 'user@local.test',
        role: payload.role || 'user',
        active: payload.active ?? true,
      })),

      listModules: jest.fn(async () => modules),

      listProgressByUser: jest.fn(async () => []),

      createModule: jest.fn(async (payload) => ({
        id: 'm2',
        active: true,
        ...payload,
      })),

      updateModule: jest.fn(async (id, payload) => ({
        id,
        ...payload,
      })),

      deleteModule: jest.fn(async () => true),

      listContentByModule: jest.fn(async () => contents),

      createContent: jest.fn(async (payload) => ({
        id: 'c2',
        ...payload,
      })),

      updateContent: jest.fn(async (id, payload) => ({
        id,
        ...payload,
      })),

      deleteContent: jest.fn(async () => true),

      getQuizByModule: jest.fn(async () => quiz),

      listQuestionsByQuiz: jest.fn(async () => questions),

      createQuiz: jest.fn(async (payload) => ({
        id: 'qz2',
        active: true,
        ...payload,
      })),

      updateQuiz: jest.fn(async (id, payload) => ({
        id,
        ...payload,
      })),

      deleteQuiz: jest.fn(async () => true),

      createQuestion: jest.fn(async (payload) => ({
        id: 'q2',
        ...payload,
      })),

      updateQuestion: jest.fn(async (id, payload) => ({
        id,
        ...payload,
      })),

      deleteQuestion: jest.fn(async () => true),

      reset: jest.fn(async () => true),

      getModule: jest.fn(async (id) => modules.find((m) => m.id === id) || null),
      getProgress: jest.fn(async () => null),
      getContentCompletions: jest.fn(async () => []),
      getQuizById: jest.fn(async (id) => (id === 'qz1' ? quiz : null)),
      getContentById: jest.fn(async (id) => contents.find((c) => c.id === id) || null),
      markContentComplete: jest.fn(async () => true),
      upsertProgress: jest.fn(async (payload) => payload),
      addAttempt: jest.fn(async () => true),
    };
  }

  async function loginAsAdmin(app) {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@local.test',
        password: 'admin123',
      });

    return response.body.token;
  }

  it('should list users for admin', async () => {
    const db = createFakeDb();
    const { app } = buildApp(db);
    const token = await loginAsAdmin(app);

    const response = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });

  it('should create module for admin', async () => {
    const db = createFakeDb();
    const { app } = buildApp(db);
    const token = await loginAsAdmin(app);

    const response = await request(app)
      .post('/api/admin/modules')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'New Module',
        description: 'Description',
        order: 2,
      });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe('New Module');
  });

  it('should update module for admin', async () => {
    const db = createFakeDb();
    const { app } = buildApp(db);
    const token = await loginAsAdmin(app);

    const response = await request(app)
      .put('/api/admin/modules/m1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Updated Module',
      });

    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Updated Module');
  });

  it('should delete module for admin', async () => {
    const db = createFakeDb();
    const { app } = buildApp(db);
    const token = await loginAsAdmin(app);

    const response = await request(app)
      .delete('/api/admin/modules/m1')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(204);
  });

  it('should create content for admin', async () => {
    const db = createFakeDb();
    const { app } = buildApp(db);
    const token = await loginAsAdmin(app);

    const response = await request(app)
      .post('/api/admin/modules/m1/contents')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'New Content',
        type: 'text',
        contentOrUrl: 'Text',
        order: 1,
      });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe('New Content');
  });

  it('should create question for admin', async () => {
    const db = createFakeDb();
    const { app } = buildApp(db);
    const token = await loginAsAdmin(app);

    const response = await request(app)
      .post('/api/admin/quizzes/qz1/questions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        text: 'Question?',
        options: ['A', 'B'],
        correctAnswer: 0,
        explanation: 'A is correct',
      });

    expect(response.status).toBe(201);
    expect(response.body.text).toBe('Question?');
  });

  it('should reject question with less than two options', async () => {
    const db = createFakeDb();
    const { app } = buildApp(db);
    const token = await loginAsAdmin(app);

    const response = await request(app)
      .post('/api/admin/quizzes/qz1/questions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        text: 'Question?',
        options: ['Only one'],
        correctAnswer: 0,
      });

    expect(response.status).toBe(400);
  });

  it('should reset platform data', async () => {
    const db = createFakeDb();
    const { app } = buildApp(db);
    const token = await loginAsAdmin(app);

    const response = await request(app)
      .post('/api/admin/reset')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
  });
});