import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

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
  message = '';
  errorMessage = '';

  private timer: any;

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
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
        this.router.navigateByUrl('/dashboard');
      } else {
        this.errorMessage = 'Your email is still not verified. Please check your inbox or resend the link.';
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'We could not verify your email right now.';
      this.errorMessage = message;
    } finally {
      this.isVerifying = false;
    }
  }

  async resendEmail() {
    this.countdown = 45;
    this.startCountdown();

    try {
      await this.authService.sendVerificationEmail();
      this.message = 'A fresh verification email has been sent.';
      this.errorMessage = '';
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'We could not resend the verification email.';
      this.errorMessage = message;
    }
  }
}