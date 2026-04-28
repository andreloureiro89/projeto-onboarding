import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import type {
  AdminUser,
  AdminContentItem,
  AdminQuiz,
  AdminQuizQuestion,
  ModuleSummary,
  UserProgress,
} from '../models/types';

@Injectable({ providedIn: 'root' })
export class AdminService {
  users = signal<AdminUser[]>([]);
  teamProgress = signal<UserProgress[]>([]);
  loading = signal(false);
  message = signal('');

  constructor(private api: ApiService) {}

  // ───── Users ─────

  async loadUsers() {
    this.loading.set(true);
    this.message.set('');
    try {
      const users = await this.api.request<AdminUser[]>('/admin/users');
      this.users.set(users);
    } catch (err) {
      this.message.set(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      this.loading.set(false);
    }
  }

  async updateUser(userId: string, payload: { role?: string; active?: boolean; name?: string }) {
    this.loading.set(true);
    this.message.set('');
    try {
      await this.api.request(`/admin/users/${userId}`, { method: 'PUT', body: payload });
      this.message.set('User updated.');
      await this.loadUsers();
    } catch (err) {
      this.message.set(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      this.loading.set(false);
    }
  }

  // ───── Team progress ─────

  async loadTeamProgress() {
    this.loading.set(true);
    try {
      const data = await this.api.request<UserProgress[]>('/admin/progress');
      this.teamProgress.set(data);
    } catch (err) {
      this.message.set(err instanceof Error ? err.message : 'Failed to load progress');
    } finally {
      this.loading.set(false);
    }
  }

  // ───── Modules ─────

  async createModule(title: string, description: string, order: number) {
    this.loading.set(true);
    this.message.set('');
    try {
      await this.api.request('/admin/modules', { method: 'POST', body: { title, description, order } });
      this.message.set('Module created.');
    } catch (err) {
      this.message.set(err instanceof Error ? err.message : 'Failed to create module');
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async updateModule(moduleId: string, payload: { title?: string; description?: string; order?: number }) {
    this.loading.set(true);
    this.message.set('');
    try {
      await this.api.request(`/admin/modules/${moduleId}`, { method: 'PUT', body: payload });
      this.message.set('Module updated.');
    } catch (err) {
      this.message.set(err instanceof Error ? err.message : 'Failed to update module');
    } finally {
      this.loading.set(false);
    }
  }

  async deleteModule(moduleId: string) {
    this.loading.set(true);
    this.message.set('');
    try {
      await this.api.request(`/admin/modules/${moduleId}`, { method: 'DELETE' });
      this.message.set('Module deleted.');
    } catch (err) {
      this.message.set(err instanceof Error ? err.message : 'Failed to delete module');
    } finally {
      this.loading.set(false);
    }
  }

  // ───── Contents ─────

  async loadContents(moduleId: string) {
    return this.api.request<AdminContentItem[]>(`/admin/modules/${moduleId}/contents`);
  }

  async createContent(moduleId: string, payload: { title: string; type: string; contentOrUrl: string; order: number }) {
    return this.api.request<AdminContentItem>(`/admin/modules/${moduleId}/contents`, { method: 'POST', body: payload });
  }

  async updateContent(contentId: string, payload: Partial<AdminContentItem>) {
    return this.api.request<AdminContentItem>(`/admin/contents/${contentId}`, { method: 'PUT', body: payload });
  }

  async deleteContent(contentId: string) {
    return this.api.request(`/admin/contents/${contentId}`, { method: 'DELETE' });
  }

  // ───── Quizzes ─────

  async loadQuiz(moduleId: string) {
    return this.api.request<AdminQuiz | null>(`/admin/modules/${moduleId}/quiz`);
  }

  async createQuiz(moduleId: string, title: string) {
    return this.api.request<AdminQuiz>(`/admin/modules/${moduleId}/quiz`, { method: 'POST', body: { title } });
  }

  async updateQuiz(quizId: string, payload: { title?: string; required?: boolean }) {
    return this.api.request(`/admin/quizzes/${quizId}`, { method: 'PUT', body: payload });
  }

  async deleteQuiz(quizId: string) {
    return this.api.request(`/admin/quizzes/${quizId}`, { method: 'DELETE' });
  }

  // ───── Questions ─────

  async createQuestion(quizId: string, payload: { text: string; options: string[]; correctAnswer: number; explanation: string }) {
    return this.api.request<AdminQuizQuestion>(`/admin/quizzes/${quizId}/questions`, { method: 'POST', body: payload });
  }

  async updateQuestion(questionId: string, payload: Partial<AdminQuizQuestion>) {
    return this.api.request(`/admin/questions/${questionId}`, { method: 'PUT', body: payload });
  }

  async deleteQuestion(questionId: string) {
    return this.api.request(`/admin/questions/${questionId}`, { method: 'DELETE' });
  }

  // ───── Reset ─────

  async resetPlatformData() {
    this.loading.set(true);
    this.message.set('');
    try {
      await this.api.request('/admin/reset', { method: 'POST' });
      this.message.set('Data reset to seed completed.');
    } catch (err) {
      this.message.set(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      this.loading.set(false);
    }
  }

  reset() {
    this.users.set([]);
    this.teamProgress.set([]);
    this.message.set('');
  }
}
