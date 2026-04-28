import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = 'http://localhost:3000/api';

  token = signal(localStorage.getItem('token') ?? '');

  async request<T>(path: string, options?: { method?: string; body?: unknown }): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.token()) {
      headers['Authorization'] = `Bearer ${this.token()}`;
    }
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: options?.method ?? 'GET',
      headers,
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });
    if (!response.ok) {
      let message = 'Request failed';
      try {
        const errorBody = (await response.json()) as { error?: string };
        message = errorBody.error || message;
      } catch {
        // keep default message
      }
      throw new Error(message);
    }
    if (response.status === 204) {
      return null as T;
    }
    return (await response.json()) as T;
  }

  setToken(token: string) {
    this.token.set(token);
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token.set('');
    localStorage.removeItem('token');
  }
}
