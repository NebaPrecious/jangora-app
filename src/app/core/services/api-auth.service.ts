import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../auth/auth.service';

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

export interface FirebaseLoginResponse {
  user: BackendUser;
  firebaseUid: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiAuthService {
  private readonly apiBaseUrl = 'http://localhost:3000';

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
}
