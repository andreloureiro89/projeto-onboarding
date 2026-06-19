import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { adminGuard } from './admin.guard';
import { AuthService } from '../services/auth.service';

describe('adminGuard', () => {
  const authMock = {
    isAdmin: jasmine.createSpy('isAdmin'),
  };

  const routerMock = {
    createUrlTree: jasmine.createSpy('createUrlTree').and.returnValue('/dashboard-tree'),
  };

  beforeEach(() => {
    authMock.isAdmin.calls.reset();
    routerMock.createUrlTree.calls.reset();

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: Router, useValue: routerMock },
      ],
    });
  });

  it('should allow access when user is admin', () => {
    authMock.isAdmin.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() => adminGuard(null as any, null as any));

    expect(result).toBeTrue();
  });

  it('should redirect to dashboard when user is not admin', () => {
    authMock.isAdmin.and.returnValue(false);

    const result = TestBed.runInInjectionContext(() => adminGuard(null as any, null as any));

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
    expect(result).toBe('/dashboard-tree' as any);
  });
});