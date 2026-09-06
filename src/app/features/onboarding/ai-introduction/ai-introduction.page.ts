import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { UserStateService } from '../../../core/services/user-state.service';
import { UserPreferencesService } from '../../../core/services/user-preferences.service';
import { SessionRestoreService } from '../../../core/services/session-restore.service';
import { NavigationFocusService } from '../../../core/services/navigation-focus.service';

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
  errorMessage = '';

  constructor(
    private router: Router,
    private readonly authService: AuthService,
    private readonly sessionRestoreService: SessionRestoreService,
    private readonly userStateService: UserStateService,
    private readonly userPreferencesService: UserPreferencesService,
    private readonly navigationFocusService: NavigationFocusService,
  ) {}

  async continue() {
    if (this.loading) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.navigationFocusService.blurActiveElement();

    try {
      await new Promise(resolve => setTimeout(resolve, 700));

      const currentUser = this.authService.getCurrentUser();

      if (currentUser?.emailVerified) {
        const { backendUser } = await this.sessionRestoreService.restoreAuthenticatedSession();
        if (backendUser) {
          this.userStateService.setUser(backendUser);
        }
        await this.userPreferencesService.saveCompletedOnboardingFromLocalStorage();
        await this.router.navigateByUrl('/dashboard');
        return;
      }

      await this.router.navigateByUrl('/register');
    } catch {
      this.errorMessage = "We couldn't connect right now. Please try again.";
    } finally {
      this.loading = false;
    }
  }
}
