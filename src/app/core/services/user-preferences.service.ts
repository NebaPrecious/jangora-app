import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, timeout } from 'rxjs';
import { API_BASE_URL } from '../api/api.config';
import { retryTransient, toFriendlyNetworkError } from '../errors/network-error.util';

export interface UserPreferencesPayload {
  primaryGoals: string[];
  preferredCurrency: string;
  incomeRange: string | null;
  notificationPreferences: string[];
  onboardingCompleted: boolean;
}

export interface BackendUserPreferences extends UserPreferencesPayload {
  id: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class UserPreferencesService {
  private readonly apiBaseUrl = API_BASE_URL;
  private readonly requestTimeoutMs = 12000;
  private readonly preferencesSubject = new BehaviorSubject<BackendUserPreferences | null>(null);
  readonly preferences$ = this.preferencesSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  getPreferences(): BackendUserPreferences | null {
    return this.preferencesSubject.getValue();
  }

  async getMyPreferences(): Promise<BackendUserPreferences> {
    try {
      const preferences = await retryTransient(() =>
        firstValueFrom(
          this.http.get<BackendUserPreferences>(`${this.apiBaseUrl}/user-preferences/me`).pipe(timeout(this.requestTimeoutMs)),
        ),
      );
      this.setPreferences(preferences);
      return preferences;
    } catch (error) {
      throw toFriendlyNetworkError(error, 'We could not load your preferences. Please try again.');
    }
  }

  async saveMyPreferences(payload: UserPreferencesPayload): Promise<BackendUserPreferences> {
    try {
      const preferences = await retryTransient(() =>
        firstValueFrom(
          this.http
            .put<BackendUserPreferences>(`${this.apiBaseUrl}/user-preferences/me`, payload)
            .pipe(timeout(this.requestTimeoutMs)),
        ),
      );
      this.setPreferences(preferences);
      this.preserveOfflineDisplayValues(preferences);
      return preferences;
    } catch (error) {
      throw toFriendlyNetworkError(error, 'We could not save your preferences. Please try again.');
    }
  }

  async ensurePreferencesForAuthenticatedUser(): Promise<BackendUserPreferences> {
    const preferences = await this.getMyPreferences();

    if (!preferences.id) {
      return this.saveMyPreferences({
        primaryGoals: preferences.primaryGoals,
        preferredCurrency: preferences.preferredCurrency,
        incomeRange: preferences.incomeRange,
        notificationPreferences: preferences.notificationPreferences,
        onboardingCompleted: preferences.onboardingCompleted,
      });
    }

    return preferences;
  }

  async saveCompletedOnboardingFromLocalStorage(): Promise<BackendUserPreferences> {
    return this.saveMyPreferences(this.buildOnboardingPayload(true));
  }

  hasLocalOnboardingValues(): boolean {
    const payload = this.buildOnboardingPayload(false);
    return !!payload.primaryGoals.length || !!payload.incomeRange || !!localStorage.getItem('currency');
  }

  buildOnboardingPayload(onboardingCompleted: boolean): UserPreferencesPayload {
    return {
      primaryGoals: this.readStringArray('primaryGoals'),
      preferredCurrency: localStorage.getItem('currency') || 'XAF',
      incomeRange: localStorage.getItem('incomeRange'),
      notificationPreferences: this.readStringArray('notifications'),
      onboardingCompleted,
    };
  }

  getNextOnboardingRoute(preferences = this.getPreferences()): string {
    const localPayload = this.buildOnboardingPayload(false);
    const primaryGoals = preferences?.primaryGoals?.length ? preferences.primaryGoals : localPayload.primaryGoals;
    const preferredCurrency = preferences?.preferredCurrency || localPayload.preferredCurrency;
    const incomeRange = preferences?.incomeRange ?? localPayload.incomeRange;

    if (!primaryGoals.length) {
      return '/goal';
    }

    if (!preferredCurrency) {
      return '/currency';
    }

    if (!incomeRange) {
      return '/income';
    }

    return '/ai-introduction';
  }

  setPreferences(preferences: BackendUserPreferences | null): void {
    this.preferencesSubject.next(preferences);

    if (preferences) {
      this.preserveOfflineDisplayValues(preferences);
    }
  }

  clearPreferences(): void {
    this.preferencesSubject.next(null);
  }

  private preserveOfflineDisplayValues(preferences: UserPreferencesPayload): void {
    localStorage.setItem('primaryGoals', JSON.stringify(preferences.primaryGoals ?? []));
    localStorage.setItem('currency', preferences.preferredCurrency || 'XAF');

    if (preferences.incomeRange) {
      localStorage.setItem('incomeRange', preferences.incomeRange);
    }

    localStorage.setItem('notifications', JSON.stringify(preferences.notificationPreferences ?? []));
  }

  private readStringArray(key: string): string[] {
    const rawValue = localStorage.getItem(key);

    if (!rawValue) {
      return [];
    }

    try {
      const parsedValue = JSON.parse(rawValue);
      return Array.isArray(parsedValue)
        ? parsedValue.filter((item): item is string => typeof item === 'string')
        : [];
    } catch {
      return [];
    }
  }
}
