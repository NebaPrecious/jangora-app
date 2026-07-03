import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  sendResetLink() {
    this.loading = true;

    setTimeout(() => {
      this.loading = false;
      this.emailSent = true;
    }, 1500);
  }

  backToLogin() {
    this.router.navigateByUrl('/login');
  }
}