import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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

  private timer: any;

  constructor(private router: Router) {}

  ngOnInit(): void {
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

  verifyEmail() {
    this.isVerifying = true;

    setTimeout(() => {
      this.isVerifying = false;
      this.router.navigateByUrl('/dashboard');
    }, 2000);
  }

  resendEmail() {
    this.countdown = 45;
    this.startCountdown();
  }
}