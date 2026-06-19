import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Router } from '@angular/router';

import { LoginPage } from './login';
import { AuthService } from '../../services/auth.service';
import { LearningService } from '../../services/learning.service';
import { AdminService } from '../../services/admin.service';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;

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

    error: signal(''),
    loading: signal(false),

    login: jasmine.createSpy('login').and.returnValue(Promise.resolve()),
    register: jasmine.createSpy('register').and.returnValue(Promise.resolve()),
    isAdmin: jasmine.createSpy('isAdmin').and.returnValue(false),
    };

  const learningMock = {
    refreshAll: jasmine.createSpy('refreshAll').and.returnValue(Promise.resolve()),
  };

  const adminMock = {
    loadUsers: jasmine.createSpy('loadUsers').and.returnValue(Promise.resolve()),
  };

  const routerMock = {
    navigate: jasmine.createSpy('navigate'),
  };

  beforeEach(async () => {
    authMock.login.calls.reset();
    authMock.register.calls.reset();
    authMock.isAdmin.calls.reset();
    learningMock.refreshAll.calls.reset();
    adminMock.loadUsers.calls.reset();
    routerMock.navigate.calls.reset();

    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: LearningService, useValue: learningMock },
        { provide: AdminService, useValue: adminMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create login page', () => {
    expect(component).toBeTruthy();
  });

  it('should switch auth mode', () => {
    component.setAuthMode('register');

    expect(component.authMode()).toBe('register');
    expect(authMock.error()).toBe('');
  });

  it('should toggle password visibility', () => {
    expect(component.showPassword()).toBeFalse();

    component.togglePasswordVisibility();

    expect(component.showPassword()).toBeTrue();
  });

  it('should login and navigate to dashboard', async () => {
    component.authMode.set('login');

    await component.submitAuth();

    expect(authMock.login).toHaveBeenCalled();
    expect(learningMock.refreshAll).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should register and navigate to dashboard', async () => {
    component.authMode.set('register');

    await component.submitAuth();

    expect(authMock.register).toHaveBeenCalled();
    expect(learningMock.refreshAll).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should load users when admin logs in', async () => {
    authMock.isAdmin.and.returnValue(true);

    await component.submitAuth();

    expect(adminMock.loadUsers).toHaveBeenCalled();
  });
});