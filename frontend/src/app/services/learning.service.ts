import { Injectable, computed, signal } from '@angular/core';
import { ApiService } from './api.service';
import type {
  ModuleDetail,
  ModuleSummary,
  ProgressItem,
  ProgressResponse,
  ProgressViewItem,
  QuizResult,
} from '../models/types';

@Injectable({ providedIn: 'root' })
export class LearningService {
  modules = signal<ModuleSummary[]>([]);
  progress = signal<ProgressResponse | null>(null);

  selectedModuleId = signal<string | null>(null);
  selectedDetail = signal<ModuleDetail | null>(null);

  quizAnswers = signal<Record<string, number>>({});
  quizResult = signal<QuizResult | null>(null);

  error = signal('');
  loading = signal(false);

  private readonly defaultModuleTitle = 'Unknown module';

  moduleTitleById = computed(() => {
    const mapping = new Map<string, string>();
    for (const m of this.modules()) {
      mapping.set(m.id, m.title);
    }
    return mapping;
  });

  progressView = computed<ProgressViewItem[]>(() => {
    const mapping = this.moduleTitleById();
    const items = this.progress()?.modules ?? [];
    return items.map((item) => ({
      ...item,
      moduleTitle: mapping.get(item.moduleId) ?? this.defaultModuleTitle,
    }));
  });

  completedModules = computed(() => this.modules().filter((m) => m.progress.status === 'completed'));
  openModules = computed(() => this.modules().filter((m) => m.progress.status !== 'completed' && !m.locked));
  lockedModules = computed(() => this.modules().filter((m) => m.locked));

  constructor(private api: ApiService) {}

  async loadModules() {
    const modules = await this.api.request<ModuleSummary[]>('/modules');
    this.modules.set(modules);

    const selectedId = this.selectedModuleId();
    if (!selectedId && modules.length > 0) {
      const firstOpen = modules.find((m) => !m.locked) ?? modules[0];
      await this.openModule(firstOpen.id);
      return;
    }
    if (selectedId && modules.some((m) => m.id === selectedId)) {
      await this.reloadDetail(selectedId);
    }
  }

  async loadProgress() {
    const progress = await this.api.request<ProgressResponse>('/progress/me');
    this.progress.set(progress);
  }

  async openModule(moduleId: string) {
    this.error.set('');
    this.selectedModuleId.set(moduleId);
    this.quizResult.set(null);
    this.quizAnswers.set({});
    await this.reloadDetail(moduleId);
  }

  private async reloadDetail(moduleId: string) {
    try {
      const detail = await this.api.request<ModuleDetail>(`/modules/${moduleId}`);
      this.selectedDetail.set(detail);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to load module');
    }
  }

  selectAnswer(questionId: string, optionIndex: number) {
    this.quizAnswers.update((current) => ({ ...current, [questionId]: optionIndex }));
  }

  async submitQuiz() {
    const detail = this.selectedDetail();
    if (!detail?.quiz) return;

    const required = detail.quiz.questions.length;
    const filled = Object.keys(this.quizAnswers()).length;
    if (filled !== required) {
      this.error.set('Please answer every question before submitting.');
      return;
    }

    this.error.set('');
    this.loading.set(true);
    try {
      const response = await this.api.request<QuizResult & { progress: ProgressItem }>(
        `/quizzes/${detail.quiz.id}/submit`,
        { method: 'POST', body: { answers: this.quizAnswers() } }
      );
      this.quizResult.set({
        score: response.score,
        passed: response.passed,
        correct: response.correct,
        total: response.total,
        questions: response.questions,
      });
      await Promise.all([this.loadModules(), this.loadProgress()]);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Quiz submission failed');
    } finally {
      this.loading.set(false);
    }
  }

  async markContentComplete(contentId: string) {
    this.loading.set(true);
    try {
      await this.api.request(`/contents/${contentId}/complete`, { method: 'POST' });
      await Promise.all([this.loadModules(), this.loadProgress()]);
      const moduleId = this.selectedModuleId();
      if (moduleId) await this.reloadDetail(moduleId);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to mark content complete');
    } finally {
      this.loading.set(false);
    }
  }

  async refreshAll() {
    await Promise.all([this.loadModules(), this.loadProgress()]);
  }

  reset() {
    this.modules.set([]);
    this.progress.set(null);
    this.selectedModuleId.set(null);
    this.selectedDetail.set(null);
    this.quizAnswers.set({});
    this.quizResult.set(null);
    this.error.set('');
  }
}
