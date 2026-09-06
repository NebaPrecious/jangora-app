import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../api/api.config';

export type ExpenseCategory =
  | 'Food'
  | 'Transport'
  | 'Bills'
  | 'Health'
  | 'Entertainment'
  | 'Shopping'
  | 'Other';

export type ExpenseRecurrenceType = 'Daily' | 'Weekly' | 'Monthly';
export type ExpenseView = 'daily' | 'weekly' | 'monthly';

export interface Expense {
  id: string;
  userId: string;
  amount: string;
  currency: string;
  category: ExpenseCategory;
  date: string;
  note: string | null;
  isRecurring: boolean;
  recurrenceType: ExpenseRecurrenceType | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpensePayload {
  amount: string;
  currency: string;
  category: ExpenseCategory;
  date: string;
  note: string | null;
  isRecurring: boolean;
  recurrenceType: ExpenseRecurrenceType | null;
}

export type UpdateExpensePayload = Partial<CreateExpensePayload>;

export interface ExpenseFilters {
  search?: string;
  category?: ExpenseCategory | '';
  dateFrom?: string;
  dateTo?: string;
  minAmount?: string;
  maxAmount?: string;
  view?: ExpenseView | '';
  page?: number;
  limit?: number;
}

export interface ExpenseListResponse {
  data: Expense[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ExpenseSummary {
  totalSpentThisMonth: number;
  transactionCountThisMonth: number;
  spendingByCategory: Array<{
    category: ExpenseCategory;
    total: number;
  }>;
  previousMonthTotal: number;
  monthOverMonthChange: number;
}

@Injectable({
  providedIn: 'root',
})
export class ExpensesService {
  private readonly apiBaseUrl = API_BASE_URL;
  private readonly refreshSubject = new BehaviorSubject<number>(0);
  readonly refresh$ = this.refreshSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  async createExpense(payload: CreateExpensePayload): Promise<Expense> {
    try {
      const expense = await firstValueFrom(this.http.post<Expense>(`${this.apiBaseUrl}/expenses`, payload));
      this.requestRefresh();
      return expense;
    } catch (error) {
      throw this.toFriendlyError(error, 'We could not save this expense. Please try again.');
    }
  }

  async getExpenses(filters: ExpenseFilters = {}): Promise<ExpenseListResponse> {
    try {
      return await firstValueFrom(
        this.http.get<ExpenseListResponse>(`${this.apiBaseUrl}/expenses`, {
          params: this.buildParams(filters),
        }),
      );
    } catch (error) {
      throw this.toFriendlyError(error, 'We could not load your expenses. Please try again.');
    }
  }

  async getExpenseById(id: string): Promise<Expense> {
    try {
      return await firstValueFrom(this.http.get<Expense>(`${this.apiBaseUrl}/expenses/${id}`));
    } catch (error) {
      throw this.toFriendlyError(error, 'We could not load this expense.');
    }
  }

  async updateExpense(id: string, payload: UpdateExpensePayload): Promise<Expense> {
    try {
      const expense = await firstValueFrom(this.http.patch<Expense>(`${this.apiBaseUrl}/expenses/${id}`, payload));
      this.requestRefresh();
      return expense;
    } catch (error) {
      throw this.toFriendlyError(error, 'We could not update this expense. Please try again.');
    }
  }

  async deleteExpense(id: string): Promise<void> {
    try {
      await firstValueFrom(this.http.delete<{ message: string }>(`${this.apiBaseUrl}/expenses/${id}`));
      this.requestRefresh();
    } catch (error) {
      throw this.toFriendlyError(error, 'We could not delete this expense. Please try again.');
    }
  }

  async getRecentExpenses(): Promise<Expense[]> {
    try {
      return await firstValueFrom(this.http.get<Expense[]>(`${this.apiBaseUrl}/expenses/recent`));
    } catch (error) {
      throw this.toFriendlyError(error, 'We could not load recent expenses.');
    }
  }

  async getExpenseSummary(): Promise<ExpenseSummary> {
    try {
      return await firstValueFrom(this.http.get<ExpenseSummary>(`${this.apiBaseUrl}/expenses/summary`));
    } catch (error) {
      throw this.toFriendlyError(error, 'We could not load your spending summary.');
    }
  }

  requestRefresh(): void {
    this.refreshSubject.next(Date.now());
  }

  private buildParams(filters: ExpenseFilters): HttpParams {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return params;
  }

  private toFriendlyError(error: unknown, fallbackMessage: string): Error {
    if (error instanceof HttpErrorResponse) {
      const backendMessage = typeof error.error?.message === 'string' ? error.error.message : '';
      return new Error(backendMessage || fallbackMessage);
    }

    return new Error(fallbackMessage);
  }
}
