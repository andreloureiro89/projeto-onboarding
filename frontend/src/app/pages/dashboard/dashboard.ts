import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { LearningService } from '../../services/learning.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardPage {
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

  trackByModuleId(_i: number, m: { id: string }) { return m.id; }
}
