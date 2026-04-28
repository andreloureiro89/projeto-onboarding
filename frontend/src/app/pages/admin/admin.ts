import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';
import { LearningService } from '../../services/learning.service';
import type {
  AdminUser,
  AdminContentItem,
  AdminQuiz,
  AdminQuizQuestion,
  ModuleSummary,
  UserProgress,
} from '../../models/types';

type AdminTab = 'modules' | 'users' | 'progress';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class AdminPage implements OnInit {
  activeTab = signal<AdminTab>('modules');

  // Module editor state
  selectedModuleId = signal<string | null>(null);
  moduleContents = signal<AdminContentItem[]>([]);
  moduleQuiz = signal<AdminQuiz | null>(null);

  // Create module form
  newTitle = signal('');
  newDescription = signal('');
  newOrder = signal(1);

  // Edit module inline
  editingModuleId = signal<string | null>(null);
  editModuleTitle = signal('');
  editModuleDesc = signal('');
  editModuleOrder = signal(1);

  // Create content form
  newContentTitle = signal('');
  newContentType = signal<'text' | 'document' | 'video'>('text');
  newContentBody = signal('');
  newContentOrder = signal(1);

  // Edit content inline
  editingContentId = signal<string | null>(null);
  editContentTitle = signal('');
  editContentType = signal<'text' | 'document' | 'video'>('text');
  editContentBody = signal('');
  editContentOrder = signal(1);

  // Create quiz
  newQuizTitle = signal('');

  // Create question form
  newQText = signal('');
  newQOptions = signal(['', '']);
  newQCorrect = signal(0);
  newQExplanation = signal('');

  // Edit question inline
  editingQuestionId = signal<string | null>(null);
  editQText = signal('');
  editQOptions = signal<string[]>([]);
  editQCorrect = signal(0);
  editQExplanation = signal('');

  constructor(
    protected auth: AuthService,
    protected admin: AdminService,
    protected learning: LearningService,
  ) {}

  async ngOnInit() {
    await Promise.all([
      this.admin.loadUsers(),
      this.admin.loadTeamProgress(),
    ]);
  }

  switchTab(tab: AdminTab) {
    this.activeTab.set(tab);
    this.selectedModuleId.set(null);
  }

  // ═══════ Module management ═══════

  async selectModule(moduleId: string) {
    this.selectedModuleId.set(moduleId);
    this.editingModuleId.set(null);
    this.editingContentId.set(null);
    this.editingQuestionId.set(null);
    await this.reloadModuleDetail(moduleId);
  }

  async reloadModuleDetail(moduleId: string) {
    const [contents, quiz] = await Promise.all([
      this.admin.loadContents(moduleId),
      this.admin.loadQuiz(moduleId),
    ]);
    this.moduleContents.set(contents);
    this.moduleQuiz.set(quiz);
  }

  async createModule() {
    const title = this.newTitle().trim();
    const description = this.newDescription().trim();
    const order = Number(this.newOrder());
    if (!title || !description) {
      this.admin.message.set('Title and description are required.');
      return;
    }
    try {
      await this.admin.createModule(title, description, order);
      this.newTitle.set('');
      this.newDescription.set('');
      this.newOrder.set(1);
      await this.learning.refreshAll();
    } catch { /* handled */ }
  }

  startEditModule(mod: ModuleSummary) {
    this.editingModuleId.set(mod.id);
    this.editModuleTitle.set(mod.title);
    this.editModuleDesc.set(mod.description);
    this.editModuleOrder.set(mod.order);
  }

  cancelEditModule() {
    this.editingModuleId.set(null);
  }

  async saveEditModule() {
    const id = this.editingModuleId();
    if (!id) return;
    await this.admin.updateModule(id, {
      title: this.editModuleTitle(),
      description: this.editModuleDesc(),
      order: this.editModuleOrder(),
    });
    this.editingModuleId.set(null);
    await this.learning.refreshAll();
  }

  async deleteModule(moduleId: string) {
    await this.admin.deleteModule(moduleId);
    if (this.selectedModuleId() === moduleId) {
      this.selectedModuleId.set(null);
      this.moduleContents.set([]);
      this.moduleQuiz.set(null);
    }
    await this.learning.refreshAll();
  }

  // ═══════ Content management ═══════

  async createContent() {
    const moduleId = this.selectedModuleId();
    if (!moduleId) return;
    const title = this.newContentTitle().trim();
    const contentOrUrl = this.newContentBody().trim();
    if (!title || !contentOrUrl) {
      this.admin.message.set('Content title and body are required.');
      return;
    }
    await this.admin.createContent(moduleId, {
      title,
      type: this.newContentType(),
      contentOrUrl,
      order: this.newContentOrder(),
    });
    this.newContentTitle.set('');
    this.newContentBody.set('');
    this.newContentOrder.set(this.moduleContents().length + 1);
    await this.reloadModuleDetail(moduleId);
  }

  startEditContent(c: AdminContentItem) {
    this.editingContentId.set(c.id);
    this.editContentTitle.set(c.title);
    this.editContentType.set(c.type as 'text' | 'document' | 'video');
    this.editContentBody.set(c.contentOrUrl);
    this.editContentOrder.set(c.order);
  }

  cancelEditContent() {
    this.editingContentId.set(null);
  }

  async saveEditContent() {
    const id = this.editingContentId();
    const moduleId = this.selectedModuleId();
    if (!id || !moduleId) return;
    await this.admin.updateContent(id, {
      title: this.editContentTitle(),
      type: this.editContentType(),
      contentOrUrl: this.editContentBody(),
      order: this.editContentOrder(),
    });
    this.editingContentId.set(null);
    await this.reloadModuleDetail(moduleId);
  }

  async deleteContent(contentId: string) {
    const moduleId = this.selectedModuleId();
    if (!moduleId) return;
    await this.admin.deleteContent(contentId);
    await this.reloadModuleDetail(moduleId);
  }

  // ═══════ Quiz management ═══════

  async createQuiz() {
    const moduleId = this.selectedModuleId();
    if (!moduleId) return;
    const title = this.newQuizTitle().trim();
    if (!title) {
      this.admin.message.set('Quiz title is required.');
      return;
    }
    await this.admin.createQuiz(moduleId, title);
    this.newQuizTitle.set('');
    await this.reloadModuleDetail(moduleId);
  }

  async deleteQuiz(quizId: string) {
    const moduleId = this.selectedModuleId();
    if (!moduleId) return;
    await this.admin.deleteQuiz(quizId);
    await this.reloadModuleDetail(moduleId);
  }

  async toggleQuizRequired(quiz: AdminQuiz) {
    const moduleId = this.selectedModuleId();
    if (!moduleId) return;
    await this.admin.updateQuiz(quiz.id, { required: !quiz.required });
    await this.reloadModuleDetail(moduleId);
  }

  // ═══════ Question management ═══════

  addOption() {
    this.newQOptions.update((opts) => [...opts, '']);
  }

  removeOption(index: number) {
    this.newQOptions.update((opts) => opts.filter((_, i) => i !== index));
    if (this.newQCorrect() >= this.newQOptions().length) {
      this.newQCorrect.set(0);
    }
  }

  updateOption(index: number, value: string) {
    this.newQOptions.update((opts) => opts.map((o, i) => (i === index ? value : o)));
  }

  async createQuestion() {
    const quiz = this.moduleQuiz();
    const moduleId = this.selectedModuleId();
    if (!quiz || !moduleId) return;
    const text = this.newQText().trim();
    const options = this.newQOptions().map((o) => o.trim()).filter(Boolean);
    if (!text || options.length < 2) {
      this.admin.message.set('Question text and at least 2 options are required.');
      return;
    }
    await this.admin.createQuestion(quiz.id, {
      text,
      options,
      correctAnswer: this.newQCorrect(),
      explanation: this.newQExplanation(),
    });
    this.newQText.set('');
    this.newQOptions.set(['', '']);
    this.newQCorrect.set(0);
    this.newQExplanation.set('');
    await this.reloadModuleDetail(moduleId);
  }

  startEditQuestion(q: AdminQuizQuestion) {
    this.editingQuestionId.set(q.id);
    this.editQText.set(q.text);
    this.editQOptions.set([...q.options]);
    this.editQCorrect.set(q.correctAnswer);
    this.editQExplanation.set(q.explanation);
  }

  cancelEditQuestion() {
    this.editingQuestionId.set(null);
  }

  editAddOption() {
    this.editQOptions.update((opts) => [...opts, '']);
  }

  editRemoveOption(index: number) {
    this.editQOptions.update((opts) => opts.filter((_, i) => i !== index));
    if (this.editQCorrect() >= this.editQOptions().length) {
      this.editQCorrect.set(0);
    }
  }

  editUpdateOption(index: number, value: string) {
    this.editQOptions.update((opts) => opts.map((o, i) => (i === index ? value : o)));
  }

  async saveEditQuestion() {
    const id = this.editingQuestionId();
    const moduleId = this.selectedModuleId();
    if (!id || !moduleId) return;
    await this.admin.updateQuestion(id, {
      text: this.editQText(),
      options: this.editQOptions(),
      correctAnswer: this.editQCorrect(),
      explanation: this.editQExplanation(),
    });
    this.editingQuestionId.set(null);
    await this.reloadModuleDetail(moduleId);
  }

  async deleteQuestion(questionId: string) {
    const moduleId = this.selectedModuleId();
    if (!moduleId) return;
    await this.admin.deleteQuestion(questionId);
    await this.reloadModuleDetail(moduleId);
  }

  // ═══════ User management ═══════

  async toggleUserRole(user: AdminUser) {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    await this.admin.updateUser(user.id, { role: newRole });
  }

  async toggleUserActive(user: AdminUser) {
    await this.admin.updateUser(user.id, { active: !user.active });
  }

  // ═══════ Reset ═══════

  async resetPlatformData() {
    await this.admin.resetPlatformData();
    await this.learning.refreshAll();
    await Promise.all([this.admin.loadUsers(), this.admin.loadTeamProgress()]);
    this.selectedModuleId.set(null);
  }

  // ═══════ Helpers ═══════

  getInitials(name: string) {
    return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  }

  getModuleTitle(moduleId: string): string {
    return this.learning.moduleTitleById().get(moduleId) ?? 'Unknown';
  }

  trackById(_i: number, item: { id: string }) { return item.id; }
}
