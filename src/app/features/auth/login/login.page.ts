import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  showPassword = false;
  errorMessage = '';

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly apiAuthService: ApiAuthService,
    private readonly userStateService: UserStateService,
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
        try {
          const backendUser = await this.apiAuthService.syncFirebaseUser();
          this.userStateService.setUser(backendUser);
        } catch (syncError: unknown) {
          const message = syncError instanceof Error ? syncError.message : 'Backend sync warning';
          console.warn('User sync warning (continuing to dashboard):', message);
        }

        this.router.navigateByUrl('/dashboard');
      } else {
        this.router.navigateByUrl('/verify-email');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unable to sign in right now.';
      this.errorMessage = message.includes('auth/') ? 'We could not sign you in. Please check your details and try again.' : message;
    } finally {
      this.loading = false;
    }
  }

  forgotPassword() {
    this.router.navigateByUrl('/forgot-password');
  }

  register() {
    this.router.navigateByUrl('/register');
  }
}