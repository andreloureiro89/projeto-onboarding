import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LearningService } from '../../services/learning.service';
import type { ContentItem, ModuleSummary, QuizQuestion } from '../../models/types';

@Component({
  selector: 'app-modules',
  imports: [CommonModule],
  templateUrl: './modules.html',
  styleUrl: './modules.css',
})
export class ModulesPage {
  constructor(
    protected auth: AuthService,
    protected learning: LearningService,
    private router: Router,
  ) {}

  async openModule(moduleId: string) {
    await this.learning.openModule(moduleId);
  }

  selectAnswer(questionId: string, optionIndex: number) {
    this.learning.selectAnswer(questionId, optionIndex);
  }

  async submitQuiz() {
    await this.learning.submitQuiz();
  }

  retryQuiz() {
    this.learning.quizResult.set(null);
    this.learning.quizAnswers.set({});
  }

  dismissResult() {
    this.learning.quizResult.set(null);
  }

  goToDashboard() {
    this.learning.quizResult.set(null);
    this.router.navigate(['/dashboard']);
  }

  async refreshAll() {
    await this.learning.refreshAll();
  }

  isUrl(value: string) {
    return /^https?:\/\//i.test(value);
  }

  isImage(value: string) {
    return /unsplash\.com|\.png|\.jpg|\.jpeg|\.gif|\.webp|\.svg/i.test(value);
  }

  async markContentComplete(contentId: string) {
    await this.learning.markContentComplete(contentId);
  }

  trackByModuleId(_i: number, m: ModuleSummary) { return m.id; }
  trackByContentId(_i: number, c: ContentItem) { return c.id; }
  trackByQuestionId(_i: number, q: QuizQuestion) { return q.id; }
}
