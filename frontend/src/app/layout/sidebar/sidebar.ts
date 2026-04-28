import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LearningService } from '../../services/learning.service';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent {
  collapsed = signal(false);

  constructor(
    protected auth: AuthService,
    private learning: LearningService,
    private admin: AdminService,
    private router: Router,
  ) {}

  toggleSidebar() {
    this.collapsed.update((v) => !v);
  }

  getInitials(name: string) {
    return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  }

  logout() {
    this.auth.logout();
    this.learning.reset();
    this.admin.reset();
    this.router.navigate(['/login']);
  }
}
