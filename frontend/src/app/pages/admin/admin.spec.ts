import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminPage } from './admin';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';
import { LearningService } from '../../services/learning.service';
import { signal, computed } from '@angular/core';

describe('AdminPage', () => {
  let component: AdminPage;
  let fixture: ComponentFixture<AdminPage>;

  const authMock = {
    company: signal({
      name: 'NovaTech Solutions',
      tagline: 'Building tomorrow',
      logo: '',
    }),
  };

  const adminMock = {
    users: signal([]),
    teamProgress: signal([]),
    loading: signal(false),
    message: signal(''),

    loadUsers: jasmine.createSpy('loadUsers').and.returnValue(Promise.resolve()),
    loadTeamProgress: jasmine.createSpy('loadTeamProgress').and.returnValue(Promise.resolve()),

    loadContents: jasmine.createSpy('loadContents').and.returnValue(Promise.resolve([])),
    loadQuiz: jasmine.createSpy('loadQuiz').and.returnValue(Promise.resolve(null)),

    createModule: jasmine.createSpy('createModule').and.returnValue(Promise.resolve()),
    updateModule: jasmine.createSpy('updateModule').and.returnValue(Promise.resolve()),
    deleteModule: jasmine.createSpy('deleteModule').and.returnValue(Promise.resolve()),

    createContent: jasmine.createSpy('createContent').and.returnValue(Promise.resolve()),
    updateContent: jasmine.createSpy('updateContent').and.returnValue(Promise.resolve()),
    deleteContent: jasmine.createSpy('deleteContent').and.returnValue(Promise.resolve()),

    createQuiz: jasmine.createSpy('createQuiz').and.returnValue(Promise.resolve()),
    updateQuiz: jasmine.createSpy('updateQuiz').and.returnValue(Promise.resolve()),
    deleteQuiz: jasmine.createSpy('deleteQuiz').and.returnValue(Promise.resolve()),

    createQuestion: jasmine.createSpy('createQuestion').and.returnValue(Promise.resolve()),
    updateQuestion: jasmine.createSpy('updateQuestion').and.returnValue(Promise.resolve()),
    deleteQuestion: jasmine.createSpy('deleteQuestion').and.returnValue(Promise.resolve()),

    updateUser: jasmine.createSpy('updateUser').and.returnValue(Promise.resolve()),
    resetPlatformData: jasmine.createSpy('resetPlatformData').and.returnValue(Promise.resolve()),
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
          completionPercent: 0,
          status: 'in_progress',
        },
      },
    ]),
    moduleTitleById: computed(() => new Map([['m1', 'Welcome']])),
    refreshAll: jasmine.createSpy('refreshAll').and.returnValue(Promise.resolve()),
  };

  beforeEach(async () => {
    Object.values(adminMock).forEach((value: any) => {
      if (value?.calls) value.calls.reset();
    });
    learningMock.refreshAll.calls.reset();

    await TestBed.configureTestingModule({
      imports: [AdminPage],
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: AdminService, useValue: adminMock },
        { provide: LearningService, useValue: learningMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create admin page', () => {
    expect(component).toBeTruthy();
  });

  it('should load users and team progress on init', () => {
    expect(adminMock.loadUsers).toHaveBeenCalled();
    expect(adminMock.loadTeamProgress).toHaveBeenCalled();
  });

  it('should switch tab and clear selected module', () => {
    component.selectedModuleId.set('m1');

    component.switchTab('users');

    expect(component.activeTab()).toBe('users');
    expect(component.selectedModuleId()).toBeNull();
  });

  it('should select module and load details', async () => {
    await component.selectModule('m1');

    expect(component.selectedModuleId()).toBe('m1');
    expect(adminMock.loadContents).toHaveBeenCalledWith('m1');
    expect(adminMock.loadQuiz).toHaveBeenCalledWith('m1');
  });

  it('should create module when form is valid', async () => {
    component.newTitle.set('New Module');
    component.newDescription.set('Description');
    component.newOrder.set(2);

    await component.createModule();

    expect(adminMock.createModule).toHaveBeenCalledWith('New Module', 'Description', 2);
    expect(component.newTitle()).toBe('');
    expect(component.newDescription()).toBe('');
    expect(learningMock.refreshAll).toHaveBeenCalled();
  });

  it('should not create module when title or description is empty', async () => {
    component.newTitle.set('');
    component.newDescription.set('');

    await component.createModule();

    expect(adminMock.createModule).not.toHaveBeenCalled();
    expect(adminMock.message()).toBe('Title and description are required.');
  });

  it('should start editing module', () => {
    component.startEditModule({
      id: 'm1',
      title: 'Welcome',
      description: 'Description',
      order: 1,
      locked: false,
      progress: {
        moduleId: 'm1',
        completionPercent: 0,
        status: 'in_progress',
      },
    });

    expect(component.editingModuleId()).toBe('m1');
    expect(component.editModuleTitle()).toBe('Welcome');
    expect(component.editModuleDesc()).toBe('Description');
  });

  it('should save edited module', async () => {
    component.editingModuleId.set('m1');
    component.editModuleTitle.set('Updated');
    component.editModuleDesc.set('Updated description');
    component.editModuleOrder.set(3);

    await component.saveEditModule();

    expect(adminMock.updateModule).toHaveBeenCalledWith('m1', {
      title: 'Updated',
      description: 'Updated description',
      order: 3,
    });
    expect(component.editingModuleId()).toBeNull();
  });

  it('should delete selected module and clear detail state', async () => {
    component.selectedModuleId.set('m1');
    component.moduleContents.set([
      {
        id: 'c1',
        moduleId: 'm1',
        title: 'Content',
        type: 'text',
        contentOrUrl: 'Body',
        order: 1,
        required: true,
      } as any,
    ]);

    await component.deleteModule('m1');

    expect(adminMock.deleteModule).toHaveBeenCalledWith('m1');
    expect(component.selectedModuleId()).toBeNull();
    expect(component.moduleContents().length).toBe(0);
    expect(component.moduleQuiz()).toBeNull();
  });

  it('should add and remove question options', () => {
    component.newQOptions.set(['A', 'B']);

    component.addOption();

    expect(component.newQOptions().length).toBe(3);

    component.removeOption(2);

    expect(component.newQOptions().length).toBe(2);
  });

  it('should update question option', () => {
    component.newQOptions.set(['A', 'B']);

    component.updateOption(1, 'Updated');

    expect(component.newQOptions()[1]).toBe('Updated');
  });

  it('should create question when form is valid', async () => {
    component.selectedModuleId.set('m1');
    component.moduleQuiz.set({
      id: 'quiz1',
      moduleId: 'm1',
      title: 'Quiz',
      active: true,
      required: true,
      questions: [],
    });

    component.newQText.set('Question?');
    component.newQOptions.set(['A', 'B']);
    component.newQCorrect.set(1);
    component.newQExplanation.set('Because B');

    await component.createQuestion();

    expect(adminMock.createQuestion).toHaveBeenCalledWith('quiz1', {
      text: 'Question?',
      options: ['A', 'B'],
      correctAnswer: 1,
      explanation: 'Because B',
    });

    expect(component.newQText()).toBe('');
    expect(component.newQOptions()).toEqual(['', '']);
  });

  it('should not create question when invalid', async () => {
    component.selectedModuleId.set('m1');
    component.moduleQuiz.set({
      id: 'quiz1',
      moduleId: 'm1',
      title: 'Quiz',
      active: true,
      required: true,
      questions: [],
    });

    component.newQText.set('');
    component.newQOptions.set(['Only one']);

    await component.createQuestion();

    expect(adminMock.createQuestion).not.toHaveBeenCalled();
    expect(adminMock.message()).toBe('Question text and at least 2 options are required.');
  });

  it('should toggle user role', async () => {
    await component.toggleUserRole({
      id: 'u1',
      name: 'User',
      email: 'user@test.pt',
      role: 'user',
      active: true,
    });

    expect(adminMock.updateUser).toHaveBeenCalledWith('u1', { role: 'admin' });
  });

  it('should toggle user active state', async () => {
    await component.toggleUserActive({
      id: 'u1',
      name: 'User',
      email: 'user@test.pt',
      role: 'user',
      active: true,
    });

    expect(adminMock.updateUser).toHaveBeenCalledWith('u1', { active: false });
  });

  it('should reset platform data', async () => {
    component.selectedModuleId.set('m1');

    await component.resetPlatformData();

    expect(adminMock.resetPlatformData).toHaveBeenCalled();
    expect(learningMock.refreshAll).toHaveBeenCalled();
    expect(adminMock.loadUsers).toHaveBeenCalled();
    expect(adminMock.loadTeamProgress).toHaveBeenCalled();
    expect(component.selectedModuleId()).toBeNull();
  });

  it('should return user initials', () => {
    expect(component.getInitials('Ana Ferreira')).toBe('AF');
  });

  it('should return module title', () => {
    expect(component.getModuleTitle('m1')).toBe('Welcome');
  });
});