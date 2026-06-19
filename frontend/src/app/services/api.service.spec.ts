import { TestBed } from '@angular/core/testing';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let fetchSpy: jasmine.Spy;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [ApiService],
    });

    service = TestBed.inject(ApiService);

    fetchSpy = spyOn(window, 'fetch');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should make a GET request without token', async () => {
    fetchSpy.and.returnValue(
      Promise.resolve(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );

    const result = await service.request<{ ok: boolean }>('/health');

    expect(fetchSpy).toHaveBeenCalledWith('http://localhost:3000/api/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: undefined,
    });

    expect(result.ok).toBeTrue();
  });

  it('should include Authorization header when token exists', async () => {
    service.setToken('fake-token');

    fetchSpy.and.returnValue(
      Promise.resolve(
        new Response(JSON.stringify({ data: 'success' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );

    await service.request('/modules');

    expect(fetchSpy).toHaveBeenCalledWith('http://localhost:3000/api/modules', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer fake-token',
      },
      body: undefined,
    });
  });

  it('should send POST request with JSON body', async () => {
    fetchSpy.and.returnValue(
      Promise.resolve(
        new Response(JSON.stringify({ token: 'abc' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );

    await service.request('/auth/login', {
      method: 'POST',
      body: {
        email: 'user@test.com',
        password: '123456',
      },
    });

    expect(fetchSpy).toHaveBeenCalledWith('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'user@test.com',
        password: '123456',
      }),
    });
  });

  it('should return null on 204 response', async () => {
    fetchSpy.and.returnValue(
      Promise.resolve(
        new Response(null, {
          status: 204,
        })
      )
    );

    const result = await service.request('/admin/modules/1', {
      method: 'DELETE',
    });

    expect(result).toBeNull();
  });

  it('should throw error message from API response', async () => {
    fetchSpy.and.returnValue(
      Promise.resolve(
        new Response(JSON.stringify({ error: 'Invalid credentials' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );

    await expectAsync(service.request('/auth/login', {
      method: 'POST',
      body: {
        email: 'wrong@test.com',
        password: 'wrong',
      },
    })).toBeRejectedWithError('Invalid credentials');
  });

  it('should store token in localStorage', () => {
    service.setToken('my-token');

    expect(service.token()).toBe('my-token');
    expect(localStorage.getItem('token')).toBe('my-token');
  });

  it('should clear token from localStorage', () => {
    service.setToken('my-token');

    service.clearToken();

    expect(service.token()).toBe('');
    expect(localStorage.getItem('token')).toBeNull();
  });
});