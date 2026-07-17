import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ApiAuthService } from '../../../core/services/api-auth.service';
import { UserStateService } from '../../../core/services/user-state.service';
import { UserPreferencesService } from '../../../core/services/user-preferences.service';

import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonButton,
  IonInput,
  IonIcon,
  IonSpinner
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  mailOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  logoGoogle
} from 'ionicons/icons';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
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
    IonIcon,
    IonSpinner
  ]
})
export class LoginPage {

  email = '';
  password = '';

  loading = false;
  googleLoading = false;
  showPassword = false;
  errorMessage = '';

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly apiAuthService: ApiAuthService,
    private readonly userStateService: UserStateService,
    private readonly userPreferencesService: UserPreferencesService,
  ) {
    addIcons({
      mailOutline,
      lockClosedOutline,
      eyeOutline,
      eyeOffOutline,
      logoGoogle
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async login() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter your email and password.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      const credentials = await this.authService.login(this.email.trim(), this.password);
      localStorage.setItem('registeredEmail', credentials.user.email || this.email.trim());

      if (await this.authService.checkEmailVerified()) {
        const backendUser = await this.apiAuthService.syncFirebaseUser();
        this.userStateService.setUser(backendUser);
        const preferences = await this.userPreferencesService.ensurePreferencesForAuthenticatedUser();
        this.router.navigateByUrl(
          preferences.onboardingCompleted ? '/dashboard' : this.userPreferencesService.getNextOnboardingRoute(preferences),
        );
      } else {
        this.router.navigateByUrl('/verify-email');
      }
    } catch (error: unknown) {
      this.errorMessage = this.getFriendlyAuthError(error, 'We could not sign you in. Please check your details and try again.');
    } finally {
      this.loading = false;
    }
  }

  async loginWithGoogle() {
    this.googleLoading = true;
    this.errorMessage = '';

    try {
      const credentials = await this.authService.loginWithGoogle();
      localStorage.setItem('registeredEmail', credentials.user.email || '');
      const backendUser = await this.apiAuthService.syncFirebaseUser();
      this.userStateService.setUser(backendUser);

      if (!credentials.user.emailVerified) {
        this.router.navigateByUrl('/verify-email');
        return;
      }

      const preferences = await this.userPreferencesService.ensurePreferencesForAuthenticatedUser();
      this.router.navigateByUrl(
        preferences.onboardingCompleted ? '/dashboard' : this.userPreferencesService.getNextOnboardingRoute(preferences),
      );
    } catch (error: unknown) {
      this.errorMessage = this.getFriendlyGoogleError(error);
    } finally {
      this.googleLoading = false;
    }
  }

  forgotPassword() {
    this.router.navigateByUrl('/forgot-password');
  }

  register() {
    this.router.navigateByUrl('/register');
  }

  private getFriendlyAuthError(error: unknown, fallback: string): string {
    const code = this.getErrorCode(error);

    switch (code) {
      case 'auth/network-request-failed':
        return 'Please check your internet connection.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      default:
        return fallback;
    }
  }

  private getFriendlyGoogleError(error: unknown): string {
    const code = this.getErrorCode(error);

    switch (code) {
      case 'auth/popup-closed-by-user':
        return 'Google sign-in was closed before it finished.';
      case 'auth/popup-blocked':
        return 'Your browser blocked the Google sign-in window. Please allow popups and try again.';
      case 'auth/cancelled-popup-request':
        return 'Google sign-in was already in progress. Please try again.';
      case 'auth/network-request-failed':
        return 'Please check your internet connection.';
      case 'auth/account-exists-with-different-credential':
        return 'An account already exists with this email. Please sign in with your original method.';
      default:
        return 'Google sign-in could not be completed. Please try again.';
    }
  }

  private getErrorCode(error: unknown): string {
    return typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code)
      : '';
  }
}
