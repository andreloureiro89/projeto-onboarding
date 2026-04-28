import { Injectable, computed, signal } from '@angular/core';
import { ApiService } from './api.service';
import type { Company, Session, User } from '../models/types';

@Injectable({ providedIn: 'root' })
export class AuthService {
  user = signal<User | null>(null);
  company = signal<Company | null>(null);
  loading = signal(false);
  error = signal('');

  isAuthenticated = computed(() => Boolean(this.api.token()));
  isAdmin = computed(() => this.user()?.role === 'admin');

  constructor(private api: ApiService) {}

  async login(email: string, password: string) {
    this.error.set('');
    this.loading.set(true);
    try {
      const session = await this.api.request<Session>('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      this.api.setToken(session.token);
      await this.loadProfile();
    } catch (err) {
      this.api.clearToken();
      this.error.set(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async register(name: string, email: string, password: string) {
    this.error.set('');
    this.loading.set(true);
    try {
      const session = await this.api.request<Session>('/auth/register', {
        method: 'POST',
        body: { name, email, password, role: 'user' },
      });
      this.api.setToken(session.token);
      await this.loadProfile();
    } catch (err) {
      this.api.clearToken();
      this.error.set(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async loadProfile() {
    const [me, companyData] = await Promise.all([
      this.api.request<User>('/auth/me'),
      this.api.request<Company>('/company'),
    ]);
    this.user.set(me);
    this.company.set(companyData);
  }

  logout() {
    this.api.clearToken();
    this.user.set(null);
    this.company.set(null);
    this.error.set('');
  }
}
