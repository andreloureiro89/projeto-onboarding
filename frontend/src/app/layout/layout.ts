import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar';
import { AuthService } from '../services/auth.service';
import { LearningService } from '../services/learning.service';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class LayoutComponent implements OnInit {
  constructor(
    private auth: AuthService,
    private learning: LearningService,
    private admin: AdminService,
  ) {}

  async ngOnInit() {
    if (!this.auth.user()) {
      try {
        await this.auth.loadProfile();
      } catch {
        return;
      }
    }
    await this.learning.refreshAll();
    if (this.auth.isAdmin()) {
      await this.admin.loadUsers();
    }
  }
}
