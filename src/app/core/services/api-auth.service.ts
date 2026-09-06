import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { API_BASE_URL } from '../api/api.config';
import { retryTransient, toFriendlyNetworkError } from '../errors/network-error.util';

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
  private readonly requestTimeoutMs = 12000;

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

      const response = await retryTransient(() =>
        firstValueFrom(this.http.post<FirebaseLoginResponse>(
          `${this.apiBaseUrl}/auth/firebase-login`,
          { idToken },
        ).pipe(timeout(this.requestTimeoutMs))),
      );

      return response.user;
    } catch (error) {
      throw toFriendlyNetworkError(error, 'We could not sync your account. Please try again.');
    }
  }

  async getCurrentUser(): Promise<BackendUser> {
    try {
      return await retryTransient(() =>
        firstValueFrom(this.http.get<BackendUser>(`${this.apiBaseUrl}/users/me`).pipe(timeout(this.requestTimeoutMs))),
      );
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 404) {
        throw error;
      }

      throw toFriendlyNetworkError(error, 'We could not load your account. Please try again.');
    }
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

  async deleteCurrentUser(): Promise<void> {
    try {
      await retryTransient(() =>
        firstValueFrom(this.http.delete<void>(`${this.apiBaseUrl}/users/me`).pipe(timeout(this.requestTimeoutMs))),
      );
    } catch (error) {
      throw toFriendlyNetworkError(error, 'We could not delete your account. Please try again.');
    }
  }
}
