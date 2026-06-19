import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  const authMock = {
    isAuthenticated: jasmine.createSpy('isAuthenticated'),
  };

  const routerMock = {
    createUrlTree: jasmine.createSpy('createUrlTree').and.returnValue('/login-tree'),
  };

  beforeEach(() => {
    authMock.isAuthenticated.calls.reset();
    routerMock.createUrlTree.calls.reset();

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: Router, useValue: routerMock },
      ],
    });
  });

  it('should allow access when user is authenticated', () => {
    authMock.isAuthenticated.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      authGuard(null as any, null as any)
    );

    expect(result).toBeTrue();
  });

  it('should redirect to login when user is not authenticated', () => {
    authMock.isAuthenticated.and.returnValue(false);

    const result = TestBed.runInInjectionContext(() =>
      authGuard(null as any, null as any)
    );

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(result).toBe('/login-tree' as any);
  });
});