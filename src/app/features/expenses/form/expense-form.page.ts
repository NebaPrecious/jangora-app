import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonSpinner,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, cashOutline, checkmarkOutline, repeatOutline } from 'ionicons/icons';

import {
  CreateExpensePayload,
  Expense,
  ExpenseCategory,
  ExpenseRecurrenceType,
  ExpensesService,
} from '../../../core/services/expenses.service';
import { UserPreferencesService } from '../../../core/services/user-preferences.service';

interface ExpenseFormState {
  amount: string | number;
  currency: string;
  category: ExpenseCategory;
  date: string;
  time: string;
  note: string;
  isRecurring: boolean;
  recurrenceType: ExpenseRecurrenceType;
}

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonSpinner,
    IonTitle,
    IonToolbar,
  ],
  templateUrl: './expense-form.page.html',
  styleUrls: ['./expense-form.page.scss'],
})
export class ExpenseFormPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly expensesService = inject(ExpensesService);
  private readonly userPreferencesService = inject(UserPreferencesService);
  private readonly toastController = inject(ToastController);

  readonly categories: ExpenseCategory[] = ['Food', 'Transport', 'Bills', 'Health', 'Entertainment', 'Shopping', 'Other'];
  readonly currencies = ['XAF', 'USD', 'EUR', 'GBP', 'NGN', 'KES', 'GHS', 'ZAR'];
  readonly recurrenceTypes: ExpenseRecurrenceType[] = ['Daily', 'Weekly', 'Monthly'];

  expenseId: string | null = null;
  isEditMode = false;
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  expandedOptions: 'currency' | 'category' | 'recurrence' | null = null;

  form: ExpenseFormState = {
    amount: '',
    currency: 'XAF',
    category: 'Food' as ExpenseCategory,
    date: '',
    time: '',
    note: '',
    isRecurring: false,
    recurrenceType: 'Monthly' as ExpenseRecurrenceType,
  };

  constructor() {
    addIcons({ calendarOutline, cashOutline, checkmarkOutline, repeatOutline });
  }

  async ngOnInit(): Promise<void> {
    this.expenseId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.expenseId;
    this.setDefaultDateTime();
    await this.setDefaultCurrency();

    if (this.expenseId) {
      await this.loadExpense(this.expenseId);
    }
  }

  async save(): Promise<void> {
    if (this.isSaving) {
      return;
    }

    const payload = this.buildPayload();

    if (!payload) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    try {
      if (this.isEditMode && this.expenseId) {
        await this.expensesService.updateExpense(this.expenseId, payload);
        await this.showToast('Expense updated successfully.');
        this.location.back();
      } else {
        await this.expensesService.createExpense(payload);
        await this.showToast('Expense saved successfully.');
        await this.router.navigateByUrl('/expenses');
      }
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'We could not save this expense. Please try again.';
    } finally {
      this.isSaving = false;
    }
  }

  cancel(): void {
    this.location.back();
  }

  handleRecurringChange(): void {
    if (!this.form.isRecurring) {
      this.form.recurrenceType = 'Monthly';
      this.expandedOptions = null;
    }
  }

  toggleOptions(field: 'currency' | 'category' | 'recurrence'): void {
    this.expandedOptions = this.expandedOptions === field ? null : field;
  }

  selectCurrency(currency: string): void {
    this.form.currency = currency;
    this.expandedOptions = null;
  }

  selectCategory(category: ExpenseCategory): void {
    this.form.category = category;
    this.expandedOptions = null;
  }

  selectRecurrenceType(recurrenceType: ExpenseRecurrenceType): void {
    this.form.recurrenceType = recurrenceType;
    this.expandedOptions = null;
  }

  private async loadExpense(id: string): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const expense = await this.expensesService.getExpenseById(id);
      this.applyExpense(expense);
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'We could not load this expense.';
    } finally {
      this.isLoading = false;
    }
  }

  private applyExpense(expense: Expense): void {
    const date = new Date(expense.date);
    this.form = {
      amount: String(Number(expense.amount)),
      currency: expense.currency,
      category: expense.category,
      date: this.toDateInputValue(date),
      time: this.toTimeInputValue(date),
      note: expense.note || '',
      isRecurring: expense.isRecurring,
      recurrenceType: expense.recurrenceType || 'Monthly',
    };
  }

  private async setDefaultCurrency(): Promise<void> {
    let preferences = this.userPreferencesService.getPreferences();

    if (!preferences) {
      try {
        preferences = await this.userPreferencesService.getMyPreferences();
      } catch {
        preferences = null;
      }
    }

    this.form.currency = preferences?.preferredCurrency || localStorage.getItem('currency') || 'XAF';
  }

  private setDefaultDateTime(): void {
    const now = new Date();
    this.form.date = this.toDateInputValue(now);
    this.form.time = this.toTimeInputValue(now);
  }

  private buildPayload(): CreateExpensePayload | null {
    const amount = this.normalizeAmount(this.form.amount);
    const currency = this.form.currency.trim().toUpperCase();
    const note = this.form.note.trim();

    if (!amount) {
      this.errorMessage = 'Please enter a positive amount.';
      return null;
    }

    if (!/^[A-Z]{3}$/.test(currency)) {
      this.errorMessage = 'Please enter a valid currency code.';
      return null;
    }

    if (!this.form.date || !this.form.time) {
      this.errorMessage = 'Please choose a date and time.';
      return null;
    }

    if (note.length > 240) {
      this.errorMessage = 'Notes must be 240 characters or fewer.';
      return null;
    }

    const date = new Date(`${this.form.date}T${this.form.time}`);

    if (Number.isNaN(date.getTime())) {
      this.errorMessage = 'Please choose a valid date and time.';
      return null;
    }

    return {
      amount,
      currency,
      category: this.form.category,
      date: date.toISOString(),
      note: note || null,
      isRecurring: this.form.isRecurring,
      recurrenceType: this.form.isRecurring ? this.form.recurrenceType : null,
    };
  }

  private normalizeAmount(value: string | number): string | null {
    const isValidMoneyText = (amount: string) => /^\d+(\.\d{1,2})?$/.test(amount) && Number(amount) > 0;

    if (typeof value === 'number') {
      if (!Number.isFinite(value) || value <= 0) {
        return null;
      }

      const amount = String(value);
      return isValidMoneyText(amount) ? amount : null;
    }

    if (typeof value !== 'string') {
      return null;
    }

    const amount = value.trim();

    if (!isValidMoneyText(amount)) {
      return null;
    }

    return amount;
  }

  private toDateInputValue(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private toTimeInputValue(date: Date): string {
    return date.toTimeString().slice(0, 5);
  }

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 1800,
      position: 'bottom',
      color: 'success',
    });
    await toast.present();
  }
}
