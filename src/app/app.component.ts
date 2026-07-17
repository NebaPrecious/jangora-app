import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from './core/auth/auth.service';
import { ApiAuthService } from './core/services/api-auth.service';
import { UserStateService } from './core/services/user-state.service';
import { BackendUserPreferences, UserPreferencesService } from './core/services/user-preferences.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor(
    private readonly authService: AuthService,
    private readonly apiAuthService: ApiAuthService,
    private readonly userStateService: UserStateService,
    private readonly userPreferencesService: UserPreferencesService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    void this.restoreUserSession();
  }

  private async restoreUserSession(): Promise<void> {
    const firebaseUser = await this.authService.waitForAuthReady();

    if (!firebaseUser) {
      this.userStateService.clearUser();
      this.userPreferencesService.clearPreferences();
      return;
    }

    try {
      const backendUser = await this.apiAuthService.restoreBackendUser();
      this.userStateService.setUser(backendUser);
      const preferences = await this.userPreferencesService.getMyPreferences();
      await this.routeAfterSessionRestore(firebaseUser.emailVerified, preferences);
    } catch (error: unknown) {
      this.userStateService.clearUser();
      this.userPreferencesService.clearPreferences();
      console.warn('Unable to restore backend user session:', error);
    }
  }

  private async routeAfterSessionRestore(
    emailVerified: boolean,
    preferences: BackendUserPreferences,
  ): Promise<void> {
    const currentPath = this.router.url.split('?')[0];
    const authPages = ['/splash', '/onboarding', '/welcome', '/login', '/register', '/forgot-password', '/verify-email'];
    const onboardingPages = ['/goal', '/currency', '/income', '/notifications', '/ai-introduction'];
    const protectedPages = ['/home', '/dashboard', '/expenses', '/savings', '/budget', '/chat', '/profile'];

    if (!emailVerified) {
      if (currentPath !== '/verify-email') {
        await this.router.navigateByUrl('/verify-email');
      }
      return;
    }

    if (preferences.onboardingCompleted) {
      if (authPages.includes(currentPath) || onboardingPages.includes(currentPath) || currentPath === '/') {
        await this.router.navigateByUrl('/dashboard');
      }
      return;
    }

    if (protectedPages.includes(currentPath) || authPages.includes(currentPath) || currentPath === '/') {
      await this.router.navigateByUrl(this.userPreferencesService.getNextOnboardingRoute(preferences));
    }
  }
}
