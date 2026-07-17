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
  personOutline,
  mailOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  logoGoogle
} from 'ionicons/icons';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
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
export class RegisterPage {

  firstName = '';
  lastName = '';
  email = '';
  password = '';
  confirmPassword = '';

  loading = false;
  googleLoading = false;
  errorMessage = '';

  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly apiAuthService: ApiAuthService,
    private readonly userStateService: UserStateService,
    private readonly userPreferencesService: UserPreferencesService,
  ) {
    addIcons({
      personOutline,
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

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async register() {
    if (!this.firstName || !this.lastName || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Please complete all fields to create your account.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      const credentials = await this.authService.register(this.email.trim(), this.password);
      localStorage.setItem('registeredEmail', credentials.user.email || this.email.trim());
      await this.authService.updateCurrentUserProfile(`${this.firstName.trim()} ${this.lastName.trim()}`);
      await this.authService.sendVerificationEmail();

      try {
        const backendUser = await this.apiAuthService.syncFirebaseUser();
        this.userStateService.setUser(backendUser);
      } catch (syncError: unknown) {
        const message = syncError instanceof Error ? syncError.message : 'Backend sync warning';
        console.warn('User sync warning (continuing to verification):', message);
      }

      this.router.navigateByUrl('/verify-email');
    } catch (error: unknown) {
      this.errorMessage = this.getFriendlyAuthError(error, 'We could not create your account. Please try again.');
    } finally {
      this.loading = false;
    }
  }

  async registerWithGoogle() {
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

      const preferences = this.userPreferencesService.hasLocalOnboardingValues()
        ? await this.userPreferencesService.saveCompletedOnboardingFromLocalStorage()
        : await this.userPreferencesService.ensurePreferencesForAuthenticatedUser();

      this.router.navigateByUrl(
        preferences.onboardingCompleted ? '/dashboard' : this.userPreferencesService.getNextOnboardingRoute(preferences),
      );
    } catch (error: unknown) {
      this.errorMessage = this.getFriendlyGoogleError(error);
    } finally {
      this.googleLoading = false;
    }
  }

  login() {
    this.router.navigateByUrl('/login');
  }

  private getFriendlyAuthError(error: unknown, fallback: string): string {
    const code = this.getErrorCode(error);

    switch (code) {
      case 'auth/network-request-failed':
        return 'Please check your internet connection.';
      case 'auth/email-already-in-use':
        return 'An account already exists with this email. Please sign in instead.';
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
