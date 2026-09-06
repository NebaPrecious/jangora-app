import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../api/api.config';

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: string;
  currentAmount: string;
  currency: string;
  targetDate: string | null;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DailySavings {
  id: string;
  userId: string;
  goalId: string | null;
  date: string;
  amount: string;
  currency: string;
  note: string | null;
  createdAt: string;
}

export interface DailySavingsPlan {
  id: string;
  userId: string;
  isEnabled: boolean;
  dailyTargetAmount: string;
  currency: string;
  reminderTime: string | null;
  currentStreak: number;
  longestStreak: number;
  lastSavedDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSavingsGoalPayload {
  name: string;
  targetAmount: string;
  currency: string;
  targetDate: string | null;
}

export type UpdateSavingsGoalPayload = Partial<CreateSavingsGoalPayload & {
  currentAmount: string;
  isCompleted: boolean;
}>;

export interface SavingsDepositPayload {
  amount: string;
  currency: string;
  date: string;
  note: string | null;
}

export interface DailySavingsPayload extends SavingsDepositPayload {
  goalId: string | null;
}

export interface DailySavingsSettingsPayload {
  isDailyModeEnabled?: boolean;
  dailyTargetAmount?: string;
  currency?: string;
  reminderTime?: string | null;
}

export interface DailySavingsResponse {
  plan: DailySavingsPlan;
  entries: DailySavings[];
  todaySaved: boolean;
}

export interface SavingsSummary {
  totalSaved: number;
  activeGoals: number;
  completedGoals: number;
  goalCompletionRate: number;
  recentSavings: DailySavings[];
  savingsOverTime: Array<{ date: string; total: number }>;
  plan: DailySavingsPlan;
}

export interface SavingsDepositResponse {
  goal: SavingsGoal;
  entry: DailySavings;
}

@Injectable({
  providedIn: 'root',
})
export class SavingsService {
  private readonly apiBaseUrl = API_BASE_URL;
  private readonly refreshSubject = new BehaviorSubject<number>(0);
  readonly refresh$ = this.refreshSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  async createGoal(payload: CreateSavingsGoalPayload): Promise<SavingsGoal> {
    try {
      const goal = await firstValueFrom(this.http.post<SavingsGoal>(`${this.apiBaseUrl}/savings/goals`, payload));
      this.requestRefresh();
      return goal;
    } catch (error) {
      throw this.toFriendlyError(error, 'We could not create this savings goal. Please try again.');
    }
  }

  async getGoals(): Promise<SavingsGoal[]> {
    try {
      return await firstValueFrom(this.http.get<SavingsGoal[]>(`${this.apiBaseUrl}/savings/goals`));
    } catch (error) {
      throw this.toFriendlyError(error, 'We could not load your savings goals. Please try again.');
    }
  }

  async getGoalById(id: string): Promise<SavingsGoal> {
    try {
      return await firstValueFrom(this.http.get<SavingsGoal>(`${this.apiBaseUrl}/savings/goals/${id}`));
    } catch (error) {
      throw this.toFriendlyError(error, 'We could not load this savings goal.');
    }
  }

  async updateGoal(id: string, payload: UpdateSavingsGoalPayload): Promise<SavingsGoal> {
    try {
      const goal = await firstValueFrom(this.http.patch<SavingsGoal>(`${this.apiBaseUrl}/savings/goals/${id}`, payload));
      this.requestRefresh();
      return goal;
    } catch (error) {
      throw this.toFriendlyError(error, 'We could not update this savings goal. Please try again.');
    }
  }

  async deleteGoal(id: string): Promise<void> {
    try {
      await firstValueFrom(this.http.delete<{ message: string }>(`${this.apiBaseUrl}/savings/goals/${id}`));
      this.requestRefresh();
    } catch (error) {
      throw this.toFriendlyError(error, 'We could not delete this savings goal. Please try again.');
    }
  }

  async addGoalDeposit(goalId: string, payload: SavingsDepositPayload): Promise<SavingsDepositResponse> {
    try {
      const response = await firstValueFrom(
        this.http.post<SavingsDepositResponse>(`${this.apiBaseUrl}/savings/goals/${goalId}/deposits`, payload),
      );
      this.requestRefresh();
      return response;
    } catch (error) {
      throw this.toFriendlyError(error, 'We could not add this savings deposit. Please try again.');
    }
  }

  async completeGoal(id: string): Promise<SavingsGoal> {
    try {
      const goal = await firstValueFrom(this.http.post<SavingsGoal>(`${this.apiBaseUrl}/savings/goals/${id}/complete`, {}));
      this.requestRefresh();
      return goal;
    } catch (error) {
      throw this.toFriendlyError(error, 'We could not complete this savings goal. Please try again.');
    }
  }

  async addDailySavings(payload: DailySavingsPayload): Promise<DailySavings> {
    try {
      const entry = await firstValueFrom(this.http.post<DailySavings>(`${this.apiBaseUrl}/savings/daily`, payload));
      this.requestRefresh();
      return entry;
    } catch (error) {
      throw this.toFriendlyError(error, 'We could not save this daily savings entry. Please try again.');
    }
  }

  async saveDailySettings(payload: DailySavingsSettingsPayload): Promise<DailySavingsPlan> {
    try {
      const plan = await firstValueFrom(this.http.post<DailySavingsPlan>(`${this.apiBaseUrl}/savings/daily`, payload));
      this.requestRefresh();
      return plan;
    } catch (error) {
      throw this.toFriendlyError(error, 'We could not save daily savings settings. Please try again.');
    }
  }

  async getDailySavings(): Promise<DailySavingsResponse> {
    try {
      return await firstValueFrom(this.http.get<DailySavingsResponse>(`${this.apiBaseUrl}/savings/daily`));
    } catch (error) {
      throw this.toFriendlyError(error, 'We could not load daily savings.');
    }
  }

  async getSummary(): Promise<SavingsSummary> {
    try {
      return await firstValueFrom(this.http.get<SavingsSummary>(`${this.apiBaseUrl}/savings/summary`));
    } catch (error) {
      throw this.toFriendlyError(error, 'We could not load your savings summary.');
    }
  }

  requestRefresh(): void {
    this.refreshSubject.next(Date.now());
  }

  private toFriendlyError(error: unknown, fallbackMessage: string): Error {
    if (error instanceof HttpErrorResponse) {
      const backendMessage = typeof error.error?.message === 'string' ? error.error.message : '';
      return new Error(backendMessage || fallbackMessage);
    }

    return new Error(fallbackMessage);
  }
}
