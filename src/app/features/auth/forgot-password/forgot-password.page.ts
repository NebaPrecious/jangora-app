import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonButton,
  IonInput,
  IonSpinner
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonButton,
    IonInput,
    IonSpinner
  ]
})
export class ForgotPasswordPage {

  email = '';
  loading = false;
  emailSent = false;
  message = '';

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
  ) {}

  async sendResetLink() {
    if (!this.email) {
      this.message = 'Please enter your email.';
      return;
    }

    this.loading = true;
    this.message = '';

    try {
      await this.authService.sendPasswordReset(this.email.trim());
      this.emailSent = true;
      this.message = 'A reset link has been sent to your email.';
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'We could not send a reset link right now.';
      this.message = message.includes('auth/') ? 'We could not send a reset link. Please try again.' : message;
    } finally {
      this.loading = false;
    }
  }

  backToLogin() {
    this.router.navigateByUrl('/login');
  }
}