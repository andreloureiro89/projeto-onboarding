import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LearningService } from '../../services/learning.service';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginPage {
  authMode = signal<'login' | 'register'>('login');
  registerName = signal('');
  email = signal('user@local.test');
  password = signal('user123');
  showPassword = signal(false);

  constructor(
    protected auth: AuthService,
    private learning: LearningService,
    private admin: AdminService,
    private router: Router,
  ) {}

  setAuthMode(mode: 'login' | 'register') {
    this.authMode.set(mode);
    this.auth.error.set('');
  }

  async submitAuth() {
    try {
      if (this.authMode() === 'register') {
        await this.auth.register(this.registerName(), this.email(), this.password());
      } else {
        await this.auth.login(this.email(), this.password());
      }
      await this.learning.refreshAll();
      if (this.auth.isAdmin()) {
        await this.admin.loadUsers();
      }
      this.router.navigate(['/dashboard']);
    } catch {
      // error already set in AuthService
    }
  }

  togglePasswordVisibility() {
    this.showPassword.update((v) => !v);
  }
}
