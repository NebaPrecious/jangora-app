import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserPreferencesService } from '../services/user-preferences.service';
import { isTransientNetworkError } from '../errors/network-error.util';
import { SessionRestoreService } from '../services/session-restore.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private readonly sessionRestoreService = inject(SessionRestoreService);
  private readonly userPreferencesService = inject(UserPreferencesService);
  private readonly router = inject(Router);

  async canActivate(): Promise<boolean> {
    try {
      const { firebaseUser, preferences } = await this.sessionRestoreService.restoreAuthenticatedSession();

      if (!firebaseUser) {
        void this.router.navigate(['/login']);
        return false;
      }

      if (!firebaseUser.emailVerified) {
        void this.router.navigate(['/verify-email']);
        return false;
      }

      if (!preferences?.onboardingCompleted) {
        void this.router.navigateByUrl(this.userPreferencesService.getNextOnboardingRoute(preferences));
        return false;
      }

      return true;
    } catch (error: unknown) {
      if (isTransientNetworkError(error)) {
        console.warn('Protected session check temporarily unavailable.');
        return false;
      }

      console.warn('Unable to restore protected session:', error);
      void this.router.navigate(['/login']);
      return false;
    }
  }
}
