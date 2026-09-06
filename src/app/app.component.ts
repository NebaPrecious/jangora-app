import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { BackendUserPreferences, UserPreferencesService } from './core/services/user-preferences.service';
import { isTransientNetworkError } from './core/errors/network-error.util';
import { SessionRestoreService } from './core/services/session-restore.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor(
    private readonly sessionRestoreService: SessionRestoreService,
    private readonly userPreferencesService: UserPreferencesService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    void this.restoreUserSession();
  }

  private async restoreUserSession(): Promise<void> {
    try {
      const { firebaseUser, preferences } = await this.sessionRestoreService.restoreAuthenticatedSession();

      if (!firebaseUser || !preferences) {
        return;
      }

      await this.routeAfterSessionRestore(firebaseUser.emailVerified, preferences);
    } catch (error: unknown) {
      if (isTransientNetworkError(error)) {
        console.warn('Backend session restore temporarily unavailable.');
        return;
      }

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
    const protectedPages = ['/home', '/dashboard', '/expenses', '/transactions', '/savings', '/budget', '/chat', '/profile'];
    const isProtectedPage = protectedPages.some((path) => currentPath === path || currentPath.startsWith(`${path}/`));

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

    if (isProtectedPage || authPages.includes(currentPath) || currentPath === '/') {
      await this.router.navigateByUrl(this.userPreferencesService.getNextOnboardingRoute(preferences));
    }
  }
}
