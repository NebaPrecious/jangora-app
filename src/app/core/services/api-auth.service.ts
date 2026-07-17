import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { API_BASE_URL } from '../api/api.config';

export interface BackendUser {
  id: string;
  firebaseUid: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  authProvider: string;
  isActive: boolean;
}

export interface UpdateCurrentUserPayload {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  profileImageUrl?: string | null;
}

export interface FirebaseLoginResponse {
  user: BackendUser;
  firebaseUid: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiAuthService {
  private readonly apiBaseUrl = API_BASE_URL;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  async syncFirebaseUser(): Promise<BackendUser> {
    try {
      const idToken = await this.authService.getIdToken();
      if (!idToken) {
        throw new Error('No Firebase ID token available');
      }

      const response = await firstValueFrom(
        this.http.post<FirebaseLoginResponse>(
          `${this.apiBaseUrl}/auth/firebase-login`,
          { idToken },
        ),
      );

      return response.user;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to synchronize user with backend';
      throw new Error(`User sync failed: ${errorMessage}`);
    }
  }

  async getCurrentUser(): Promise<BackendUser> {
    return firstValueFrom(
      this.http.get<BackendUser>(`${this.apiBaseUrl}/users/me`),
    );
  }

  async restoreBackendUser(): Promise<BackendUser> {
    try {
      return await this.getCurrentUser();
    } catch (error: unknown) {
      if (error instanceof HttpErrorResponse && error.status === 404) {
        return this.syncFirebaseUser();
      }

      throw error;
    }
  }

  async updateCurrentUser(payload: UpdateCurrentUserPayload): Promise<BackendUser> {
    return firstValueFrom(
      this.http.patch<BackendUser>(`${this.apiBaseUrl}/users/me`, payload),
    );
  }
}
