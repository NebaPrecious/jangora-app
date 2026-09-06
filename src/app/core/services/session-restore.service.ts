import { Injectable } from '@angular/core';
import { User } from 'firebase/auth';

import { AuthService } from '../auth/auth.service';
import { isTransientNetworkError } from '../errors/network-error.util';
import { ApiAuthService, BackendUser } from './api-auth.service';
import { BackendUserPreferences, UserPreferencesService } from './user-preferences.service';
import { UserStateService } from './user-state.service';

export interface SessionRestoreResult {
  firebaseUser: User | null;
  backendUser: BackendUser | null;
  preferences: BackendUserPreferences | null;
}

@Injectable({
  providedIn: 'root',
})
export class SessionRestoreService {
  private inFlightRestore: Promise<SessionRestoreResult> | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly apiAuthService: ApiAuthService,
    private readonly userStateService: UserStateService,
    private readonly userPreferencesService: UserPreferencesService,
  ) {}

  async restoreAuthenticatedSession(): Promise<SessionRestoreResult> {
    if (this.inFlightRestore) {
      return this.inFlightRestore;
    }

    this.inFlightRestore = this.runRestore();

    try {
      return await this.inFlightRestore;
    } finally {
      this.inFlightRestore = null;
    }
  }

  clearSessionState(): void {
    this.userStateService.clearUser();
    this.userPreferencesService.clearPreferences();
  }

  private async runRestore(): Promise<SessionRestoreResult> {
    const firebaseUser = await this.authService.waitForAuthReady();

    if (!firebaseUser) {
      this.clearSessionState();
      return { firebaseUser: null, backendUser: null, preferences: null };
    }

    try {
      const backendUser = this.userStateService.getUser() ?? (await this.apiAuthService.restoreBackendUser());
      this.userStateService.setUser(backendUser);

      const preferences = this.userPreferencesService.getPreferences() ?? (await this.userPreferencesService.getMyPreferences());
      return { firebaseUser, backendUser, preferences };
    } catch (error) {
      if (!isTransientNetworkError(error)) {
        this.clearSessionState();
      }

      throw error;
    }
  }
}
