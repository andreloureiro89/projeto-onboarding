import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';

describe('AuthService', () => {
  let service: AuthService;

  const apiMock = {
    token: jasmine.createSpy('token').and.returnValue(''),
    request: jasmine.createSpy('request'),
    setToken: jasmine.createSpy('setToken'),
    clearToken: jasmine.createSpy('clearToken'),
  };

  beforeEach(() => {
    apiMock.request.calls.reset();
    apiMock.setToken.calls.reset();
    apiMock.clearToken.calls.reset();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: ApiService, useValue: apiMock },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login and load profile', async () => {
    apiMock.request.and.callFake((path: string) => {
      if (path === '/auth/login') {
        return Promise.resolve({ token: 'fake-token' });
      }

      if (path === '/auth/me') {
        return Promise.resolve({
          id: '1',
          name: 'André',
          email: 'andre@test.pt',
          role: 'user',
          active: true,
        });
      }

      if (path === '/company') {
        return Promise.resolve({
          name: 'NovaTech Solutions',
          tagline: 'Building tomorrow',
          logo: '',
        });
      }

      return Promise.reject(new Error('unknown endpoint'));
    });

    await service.login('andre@test.pt', '123456');

    expect(apiMock.setToken).toHaveBeenCalledWith('fake-token');
    expect(service.user()?.email).toBe('andre@test.pt');
    expect(service.company()?.name).toBe('NovaTech Solutions');
  });

  it('should clear session on logout', () => {
    service.logout();

    expect(apiMock.clearToken).toHaveBeenCalled();
    expect(service.user()).toBeNull();
    expect(service.company()).toBeNull();
    expect(service.error()).toBe('');
  });
});