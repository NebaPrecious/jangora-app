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
  errorMessage = '';

  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
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
    if (!this.email || !this.password || !this.confirmPassword) {
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
      await this.authService.sendVerificationEmail();
      this.router.navigateByUrl('/verify-email');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unable to create your account right now.';
      this.errorMessage = message.includes('auth/') ? 'We could not create your account. Please try again.' : message;
    } finally {
      this.loading = false;
    }
  }

  login() {
    this.router.navigateByUrl('/login');
  }
}