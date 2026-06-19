import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardPage } from './dashboard';
import { AuthService } from '../../services/auth.service';
import { LearningService } from '../../services/learning.service';
import { Router } from '@angular/router';
import { signal } from '@angular/core';

describe('DashboardPage', () => {
  let component: DashboardPage;
  let fixture: ComponentFixture<DashboardPage>;

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
    ]),

    progress: signal({
        globalPercent: 100,
        modules: [
        {
            moduleId: 'm1',
            completionPercent: 100,
            status: 'completed',
        },
        ],
    }),

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

    openModules: signal([]),

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
      imports: [DashboardPage],
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: LearningService, useValue: learningMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create dashboard page', () => {
    expect(component).toBeTruthy();
  });

  it('should open module and navigate to modules page', async () => {
    await component.openModule('m1');

    expect(learningMock.openModule).toHaveBeenCalledWith('m1');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/modules']);
  });

  it('should refresh dashboard data', async () => {
    await component.refreshAll();

    expect(learningMock.refreshAll).toHaveBeenCalled();
  });

  it('should return module id in trackBy function', () => {
    const result = component.trackByModuleId(0, {
      id: 'm1',
    });

    expect(result).toBe('m1');
  });
});