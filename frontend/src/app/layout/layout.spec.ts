import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { LayoutComponent } from './layout';
import { AuthService } from '../services/auth.service';
import { LearningService } from '../services/learning.service';
import { AdminService } from '../services/admin.service';
import { provideRouter } from '@angular/router';

describe('LayoutComponent', () => {
  let component: LayoutComponent;
  let fixture: ComponentFixture<LayoutComponent>;

  const authMock = {
    user: signal<any>(null),
    loadProfile: jasmine.createSpy('loadProfile').and.returnValue(Promise.resolve()),
    isAdmin: jasmine.createSpy('isAdmin').and.returnValue(false),
  };

  const learningMock = {
    refreshAll: jasmine.createSpy('refreshAll').and.returnValue(Promise.resolve()),
  };

  const adminMock = {
    loadUsers: jasmine.createSpy('loadUsers').and.returnValue(Promise.resolve()),
  };

  beforeEach(async () => {
    authMock.user.set(null);
    authMock.loadProfile.calls.reset();
    authMock.loadProfile.and.returnValue(Promise.resolve());
    authMock.isAdmin.calls.reset();
    authMock.isAdmin.and.returnValue(false);

    learningMock.refreshAll.calls.reset();
    adminMock.loadUsers.calls.reset();

    await TestBed.configureTestingModule({
        imports: [LayoutComponent],
        providers: [
            provideRouter([]),

            { provide: AuthService, useValue: authMock },
            { provide: LearningService, useValue: learningMock },
            { provide: AdminService, useValue: adminMock },
        ],
        }).compileComponents();

    fixture = TestBed.createComponent(LayoutComponent);
    component = fixture.componentInstance;
  });

  it('should create layout component', () => {
    expect(component).toBeTruthy();
  });

  it('should load profile when user is not loaded', async () => {
    await component.ngOnInit();

    expect(authMock.loadProfile).toHaveBeenCalled();
  });

  it('should refresh learning data on init', async () => {
    authMock.user.set({
      id: 'u1',
      name: 'André',
      email: 'andre@test.pt',
      role: 'user',
      active: true,
    });

    await component.ngOnInit();

    expect(learningMock.refreshAll).toHaveBeenCalled();
  });

  it('should load users when logged user is admin', async () => {
    authMock.user.set({
      id: 'a1',
      name: 'Admin',
      email: 'admin@test.pt',
      role: 'admin',
      active: true,
    });

    authMock.isAdmin.and.returnValue(true);

    await component.ngOnInit();

    expect(adminMock.loadUsers).toHaveBeenCalled();
  });

  it('should stop initialization if profile loading fails', async () => {
    authMock.loadProfile.and.returnValue(Promise.reject(new Error('Unauthorized')));

    await component.ngOnInit();

    expect(learningMock.refreshAll).not.toHaveBeenCalled();
    expect(adminMock.loadUsers).not.toHaveBeenCalled();
  });
});