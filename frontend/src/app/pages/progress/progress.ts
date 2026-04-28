import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LearningService } from '../../services/learning.service';
import type { ProgressItem } from '../../models/types';

@Component({
  selector: 'app-progress',
  imports: [CommonModule],
  templateUrl: './progress.html',
  styleUrl: './progress.css',
})
export class ProgressPage {
  constructor(
    protected auth: AuthService,
    protected learning: LearningService,
    private router: Router,
  ) {}

  async openModule(moduleId: string) {
    await this.learning.openModule(moduleId);
    this.router.navigate(['/modules']);
  }

  async refreshAll() {
    await this.learning.refreshAll();
  }

  toStatusLabel(status: ProgressItem['status']) {
    return status === 'completed' ? 'Completed' : 'In progress';
  }
}
