import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Router } from '@angular/router';

import { ProgressPage } from './progress';
import { AuthService } from '../../services/auth.service';
import { LearningService } from '../../services/learning.service';

describe('ProgressPage', () => {
  let component: ProgressPage;
  let fixture: ComponentFixture<ProgressPage>;

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
    modules: signal([
        {
            id: 'm1',
            title: 'Welcome',
            description: 'First module',
            order: 1,
            active: true,
            locked: false,
            progress: {
            moduleId: 'm1',
            completionPercent: 100,
            status: 'completed',
            },
        },
        {
            id: 'm2',
            title: 'Workplace',
            description: 'Second module',
            order: 2,
            active: true,
            locked: false,
            progress: {
            moduleId: 'm2',
            completionPercent: 0,
            status: 'in_progress',
            },
        },
    ]),
    progress: signal({
      globalPercent: 50,
      modules: [
        {
          moduleId: 'm1',
          completionPercent: 100,
          status: 'completed',
        },
        {
          moduleId: 'm2',
          completionPercent: 0,
          status: 'in_progress',
        },
      ],
    }),

    progressView: signal([
      {
        moduleId: 'm1',
        moduleTitle: 'Welcome',
        completionPercent: 100,
        status: 'completed',
      },
      {
        moduleId: 'm2',
        moduleTitle: 'Workplace',
        completionPercent: 0,
        status: 'in_progress',
      },
    ]),

    completedModules: signal([
      {
        id: 'm1',
        title: 'Welcome',
        description: 'First module',
        order: 1,
        active: true,
        locked: false,
        progress: {
          moduleId: 'm1',
          completionPercent: 100,
          status: 'completed',
        },
      },
    ]),

    openModules: signal([
      {
        id: 'm2',
        title: 'Workplace',
        description: 'Second module',
        order: 2,
        active: true,
        locked: false,
        progress: {
          moduleId: 'm2',
          completionPercent: 0,
          status: 'in_progress',
        },
      },
    ]),

    lockedModules: signal([]),

    openModule: jasmine.createSpy('openModule').and.returnValue(Promise.resolve()),
    refreshAll: jasmine.createSpy('refreshAll').and.returnValue(Promise.resolve()),
  };

  const routerMock = {
    navigate: jasmine.createSpy('navigate'),
  };

  beforeEach(async () => {
    learningMock.openModule.calls.reset();
    learningMock.refreshAll.calls.reset();
    routerMock.navigate.calls.reset();

    await TestBed.configureTestingModule({
      imports: [ProgressPage],
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: LearningService, useValue: learningMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create progress page', () => {
    expect(component).toBeTruthy();
  });

  it('should open module and navigate to modules page', async () => {
    await component.openModule('m1');

    expect(learningMock.openModule).toHaveBeenCalledWith('m1');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/modules']);
  });

  it('should refresh all data', async () => {
    await component.refreshAll();

    expect(learningMock.refreshAll).toHaveBeenCalled();
  });

  it('should return completed status label', () => {
    expect(component.toStatusLabel('completed')).toBe('Completed');
  });

  it('should return in progress status label', () => {
    expect(component.toStatusLabel('in_progress')).toBe('In progress');
  });
});