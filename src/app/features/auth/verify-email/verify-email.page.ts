import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ApiAuthService } from '../../../core/services/api-auth.service';
import { UserStateService } from '../../../core/services/user-state.service';

import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonButton,
  IonSpinner
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  templateUrl: './verify-email.page.html',
  styleUrls: ['./verify-email.page.scss'],
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonButton,
    IonSpinner
  ]
})
export class VerifyEmailPage implements OnInit, OnDestroy {

  email = localStorage.getItem('registeredEmail') || '';

  countdown = 45;

  isVerifying = false;
  isResending = false;
  message = '';
  errorMessage = '';

  private timer: any;

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly apiAuthService: ApiAuthService,
    private readonly userStateService: UserStateService,
  ) {}

  ngOnInit(): void {
    this.email = localStorage.getItem('registeredEmail') || this.authService.getCurrentUser()?.email || '';
    this.startCountdown();
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  startCountdown() {
    clearInterval(this.timer);

    this.timer = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown--;
      } else {
        clearInterval(this.timer);
      }
    }, 1000);
  }

  async verifyEmail() {
    this.isVerifying = true;
    this.errorMessage = '';
    this.message = '';

    try {
      const verified = await this.authService.checkEmailVerified();

      if (verified) {
        const backendUser = await this.apiAuthService.syncFirebaseUser();
        this.userStateService.setUser(backendUser);
        this.router.navigateByUrl('/dashboard');
      } else {
        this.errorMessage = 'Your email is not verified yet. Please open the verification email and try again.';
      }
    } catch (error: unknown) {
      this.errorMessage = this.getFriendlyFirebaseError(error);
    } finally {
      this.isVerifying = false;
    }
  }

  async resendEmail() {
    if (this.countdown > 0) {
      return;
    }

    this.isResending = true;
    this.errorMessage = '';
    this.message = '';

    try {
      await this.authService.sendVerificationEmail();
      this.message = 'A fresh verification email has been sent.';
      this.countdown = 45;
      this.startCountdown();
    } catch (error: unknown) {
      this.errorMessage = this.getFriendlyFirebaseError(error);
    } finally {
      this.isResending = false;
    }
  }

  private getFriendlyFirebaseError(error: unknown): string {
    const code =
      typeof error === 'object' && error !== null && 'code' in error
        ? String((error as { code?: unknown }).code)
        : '';

    switch (code) {
      case 'auth/too-many-requests':
        return 'Too many requests were made. Please wait a few minutes before trying again.';
      case 'auth/network-request-failed':
        return 'Please check your internet connection.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/user-token-expired':
        return 'Your session expired. Please sign in again.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }
}
