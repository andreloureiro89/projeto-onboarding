import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Router } from '@angular/router';

import { ModulesPage } from './modules';
import { AuthService } from '../../services/auth.service';
import { LearningService } from '../../services/learning.service';

describe('ModulesPage', () => {
  let component: ModulesPage;
  let fixture: ComponentFixture<ModulesPage>;

  const authMock = {
    user: signal({
      id: 'u1',
      name: 'André',
      email: 'andre@test.pt',
      role: 'user',
      active: true,
    }),
    company: signal({
      name: 'NovaTech Solutions',
      tagline: 'Building tomorrow',
      logo: '',
    }),
  };

  const learningMock = {
    modules: signal([]),
    selectedDetail: signal(null),
    selectedModuleId: signal(null),
    quizAnswers: signal<Record<string, number>>({}),
    quizResult: signal<any>(null),
    error: signal(''),
    loading: signal(false),

    openModule: jasmine.createSpy('openModule').and.returnValue(Promise.resolve()),
    selectAnswer: jasmine.createSpy('selectAnswer'),
    submitQuiz: jasmine.createSpy('submitQuiz').and.returnValue(Promise.resolve()),
    refreshAll: jasmine.createSpy('refreshAll').and.returnValue(Promise.resolve()),
    markContentComplete: jasmine.createSpy('markContentComplete').and.returnValue(Promise.resolve()),
  };

  const routerMock = {
    navigate: jasmine.createSpy('navigate'),
  };

  beforeEach(async () => {
    learningMock.openModule.calls.reset();
    learningMock.selectAnswer.calls.reset();
    learningMock.submitQuiz.calls.reset();
    learningMock.refreshAll.calls.reset();
    learningMock.markContentComplete.calls.reset();
    routerMock.navigate.calls.reset();

    await TestBed.configureTestingModule({
      imports: [ModulesPage],
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: LearningService, useValue: learningMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModulesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create modules page', () => {
    expect(component).toBeTruthy();
  });

  it('should open module', async () => {
    await component.openModule('m1');

    expect(learningMock.openModule).toHaveBeenCalledWith('m1');
  });

  it('should select quiz answer', () => {
    component.selectAnswer('q1', 2);

    expect(learningMock.selectAnswer).toHaveBeenCalledWith('q1', 2);
  });

  it('should submit quiz', async () => {
    await component.submitQuiz();

    expect(learningMock.submitQuiz).toHaveBeenCalled();
  });

  it('should retry quiz by clearing result and answers', () => {
    learningMock.quizResult.set({ score: 100 });
    learningMock.quizAnswers.set({ q1: 0 });

    component.retryQuiz();

    expect(learningMock.quizResult()).toBeNull();
    expect(learningMock.quizAnswers()).toEqual({});
  });

  it('should dismiss quiz result', () => {
    learningMock.quizResult.set({ score: 100 });

    component.dismissResult();

    expect(learningMock.quizResult()).toBeNull();
  });

  it('should go to dashboard and clear quiz result', () => {
    learningMock.quizResult.set({ score: 100 });

    component.goToDashboard();

    expect(learningMock.quizResult()).toBeNull();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should refresh all data', async () => {
    await component.refreshAll();

    expect(learningMock.refreshAll).toHaveBeenCalled();
  });

  it('should detect valid URL', () => {
    expect(component.isUrl('https://example.com')).toBeTrue();
    expect(component.isUrl('http://example.com')).toBeTrue();
    expect(component.isUrl('not-a-url')).toBeFalse();
  });

  it('should detect image URL', () => {
    expect(component.isImage('https://example.com/image.png')).toBeTrue();
    expect(component.isImage('https://example.com/image.jpg')).toBeTrue();
    expect(component.isImage('https://unsplash.com/photo/test')).toBeTrue();
    expect(component.isImage('https://example.com/file.pdf')).toBeFalse();
  });

  it('should mark content as complete', async () => {
    await component.markContentComplete('c1');

    expect(learningMock.markContentComplete).toHaveBeenCalledWith('c1');
  });

  it('should return module id in trackByModuleId', () => {
    expect(component.trackByModuleId(0, {
      id: 'm1',
    } as any)).toBe('m1');
  });

  it('should return content id in trackByContentId', () => {
    expect(component.trackByContentId(0, {
      id: 'c1',
    } as any)).toBe('c1');
  });

  it('should return question id in trackByQuestionId', () => {
    expect(component.trackByQuestionId(0, {
      id: 'q1',
    } as any)).toBe('q1');
  });
});