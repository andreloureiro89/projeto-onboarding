import { TestBed } from '@angular/core/testing';
import { LearningService } from './learning.service';
import { ApiService } from './api.service';

describe('LearningService', () => {
  let service: LearningService;

  const modulesMock = [
    {
      id: 'm1',
      title: 'Welcome',
      description: 'First module',
      order: 1,
      active: true,
      locked: false,
      progress: {
        moduleId: 'm1',
        completionPercent: 0,
        status: 'in_progress',
      },
    },
  ];

  const detailMock = {
    module: {
      id: 'm1',
      title: 'Welcome',
      description: 'First module',
      order: 1,
      active: true,
    },
    contents: [
      {
        id: 'c1',
        moduleId: 'm1',
        title: 'Intro',
        type: 'text',
        contentOrUrl: 'Welcome content',
        order: 1,
        required: true,
        completed: false,
      },
    ],
    quiz: {
      id: 'qz1',
      moduleId: 'm1',
      title: 'Welcome Quiz',
      active: true,
      required: true,
      questions: [
        {
          id: 'q1',
          text: 'Question 1',
          options: ['A', 'B'],
        },
      ],
    },
    progress: {
      moduleId: 'm1',
      completionPercent: 0,
      status: 'in_progress',
    },
  };

  const progressMock = {
    globalPercent: 0,
    modules: [
      {
        moduleId: 'm1',
        completionPercent: 0,
        status: 'in_progress',
      },
    ],
  };

  const quizResultMock = {
    score: 100,
    passed: true,
    correct: 1,
    total: 1,
    progress: {
      moduleId: 'm1',
      completionPercent: 100,
      status: 'completed',
    },
    questions: [
      {
        questionId: 'q1',
        text: 'Question 1',
        options: ['A', 'B'],
        selectedAnswer: 0,
        correctAnswer: 0,
        isCorrect: true,
        explanation: 'Correct.',
      },
    ],
  };

  const apiMock = {
    request: jasmine.createSpy('request'),
  };

  beforeEach(() => {
    apiMock.request.calls.reset();

    apiMock.request.and.callFake((path: string) => {
      if (path === '/modules') {
        return Promise.resolve(modulesMock);
      }

      if (path === '/modules/m1') {
        return Promise.resolve(detailMock);
      }

      if (path === '/progress/me') {
        return Promise.resolve(progressMock);
      }

      if (path === '/quizzes/qz1/submit') {
        return Promise.resolve(quizResultMock);
      }

      if (path === '/contents/c1/complete') {
        return Promise.resolve({ ok: true });
      }

      return Promise.reject(new Error(`Unknown endpoint: ${path}`));
    });

    TestBed.configureTestingModule({
      providers: [
        LearningService,
        { provide: ApiService, useValue: apiMock },
      ],
    });

    service = TestBed.inject(LearningService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load modules and open first available module', async () => {
    await service.loadModules();

    expect(service.modules().length).toBe(1);
    expect(service.selectedModuleId()).toBe('m1');
    expect(service.selectedDetail()?.module.title).toBe('Welcome');
  });

  it('should load progress', async () => {
    await service.loadProgress();

    expect(service.progress()?.globalPercent).toBe(0);
    expect(service.progressView()[0].moduleTitle).toBe('Unknown module');
  });

  it('should select quiz answer', () => {
    service.selectAnswer('q1', 0);

    expect(service.quizAnswers()['q1']).toBe(0);
  });

  it('should submit quiz and store result', async () => {
    await service.loadModules();
    service.selectAnswer('q1', 0);

    await service.submitQuiz();

    expect(service.quizResult()?.score).toBe(100);
    expect(service.quizResult()?.passed).toBeTrue();
  });

  it('should show error if quiz is submitted without all answers', async () => {
    await service.loadModules();

    await service.submitQuiz();

    expect(service.error()).toBe('Please answer every question before submitting.');
  });

  it('should mark content as complete', async () => {
    await service.loadModules();

    await service.markContentComplete('c1');

    expect(apiMock.request).toHaveBeenCalledWith('/contents/c1/complete', {
      method: 'POST',
    });
  });

  it('should reset state', () => {
    service.modules.set(modulesMock as any);
    service.progress.set(progressMock as any);
    service.selectedModuleId.set('m1');
    service.quizAnswers.set({ q1: 0 });

    service.reset();

    expect(service.modules().length).toBe(0);
    expect(service.progress()).toBeNull();
    expect(service.selectedModuleId()).toBeNull();
    expect(Object.keys(service.quizAnswers()).length).toBe(0);
  });
});