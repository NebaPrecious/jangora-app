import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ApiAuthService } from '../services/api-auth.service';
import { UserStateService } from '../services/user-state.service';
import { UserPreferencesService } from '../services/user-preferences.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private readonly authService = inject(AuthService);
  private readonly apiAuthService = inject(ApiAuthService);
  private readonly userStateService = inject(UserStateService);
  private readonly userPreferencesService = inject(UserPreferencesService);
  private readonly router = inject(Router);

  async canActivate(): Promise<boolean> {
    const firebaseUser = await this.authService.waitForAuthReady();

    if (!firebaseUser) {
      this.userStateService.clearUser();
      this.userPreferencesService.clearPreferences();
      void this.router.navigate(['/login']);
      return false;
    }

    if (!firebaseUser.emailVerified) {
      void this.router.navigate(['/verify-email']);
      return false;
    }

    try {
      const backendUser = this.userStateService.getUser() ?? (await this.apiAuthService.restoreBackendUser());
      this.userStateService.setUser(backendUser);

      const preferences = this.userPreferencesService.getPreferences() ?? (await this.userPreferencesService.getMyPreferences());
      if (!preferences.onboardingCompleted) {
        void this.router.navigateByUrl(this.userPreferencesService.getNextOnboardingRoute(preferences));
        return false;
      }

      return true;
    } catch (error: unknown) {
      this.userStateService.clearUser();
      this.userPreferencesService.clearPreferences();
      console.warn('Unable to restore protected session:', error);
      void this.router.navigate(['/login']);
      return false;
    }
  }
}
