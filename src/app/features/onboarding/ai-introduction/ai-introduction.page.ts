import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
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
  IonProgressBar,
  IonFooter
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-ai-introduction',
  templateUrl: './ai-introduction.page.html',
  styleUrls: ['./ai-introduction.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonButton,
    IonProgressBar,
    IonFooter
  ]
})
export class AiIntroductionPage {

  loading = false;

  constructor(
    private router: Router,
    private readonly authService: AuthService,
    private readonly apiAuthService: ApiAuthService,
    private readonly userStateService: UserStateService,
    private readonly userPreferencesService: UserPreferencesService,
  ) {}

  async continue() {
    this.loading = true;

    await new Promise(resolve => setTimeout(resolve, 700));

    const currentUser = this.authService.getCurrentUser();

    if (currentUser?.emailVerified) {
      try {
        const backendUser = await this.apiAuthService.restoreBackendUser();
        this.userStateService.setUser(backendUser);
        await this.userPreferencesService.saveCompletedOnboardingFromLocalStorage();
      } catch {
        console.warn('Preference sync warning after onboarding.');
      }

      this.router.navigateByUrl('/dashboard');
      return;
    }

    this.router.navigateByUrl('/register');
  }
}
