import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonSpinner,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular/standalone';

import { DailySavingsPayload, SavingsGoal, SavingsService } from '../../../core/services/savings.service';

interface AddSavingsFormState {
  goalId: string;
  amount: string | number;
  currency: string;
  date: string;
  note: string;
}

@Component({
  selector: 'app-add-savings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonSpinner,
    IonTitle,
    IonToolbar,
  ],
  templateUrl: './add-savings.page.html',
  styleUrls: ['./add-savings.page.scss'],
})
export class AddSavingsPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly savingsService = inject(SavingsService);
  private readonly toastController = inject(ToastController);

  readonly currencies = ['XAF', 'USD', 'EUR', 'GBP', 'NGN', 'KES', 'GHS', 'ZAR'];

  goals: SavingsGoal[] = [];
  isLoading = true;
  isSaving = false;
  errorMessage = '';
  expandedOptions: 'goal' | 'currency' | null = null;

  form: AddSavingsFormState = {
    goalId: '',
    amount: '',
    currency: localStorage.getItem('currency') || 'XAF',
    date: new Date().toISOString().slice(0, 10),
    note: '',
  };

  constructor() {}

  async ngOnInit(): Promise<void> {
    await this.loadGoals();
  }

  async save(): Promise<void> {
    if (this.isSaving) return;

    const payload = this.buildPayload();
    if (!payload) return;

    this.isSaving = true;
    this.errorMessage = '';

    try {
      if (payload.goalId) {
        await this.savingsService.addGoalDeposit(payload.goalId, {
          amount: payload.amount,
          currency: payload.currency,
          date: payload.date,
          note: payload.note,
        });
      } else {
        await this.savingsService.addDailySavings(payload);
      }

      await this.showToast('Savings added successfully.');
      await this.router.navigateByUrl('/savings');
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'We could not add these savings. Please try again.';
    } finally {
      this.isSaving = false;
    }
  }

  cancel(): void {
    this.location.back();
  }

  toggleOptions(field: 'goal' | 'currency'): void {
    this.expandedOptions = this.expandedOptions === field ? null : field;
  }

  selectGoal(goalId: string): void {
    this.form.goalId = goalId;
    const goal = this.goals.find((item) => item.id === goalId);
    if (goal) this.form.currency = goal.currency;
    this.expandedOptions = null;
  }

  selectCurrency(currency: string): void {
    this.form.currency = currency;
    this.expandedOptions = null;
  }

  selectedGoalName(): string {
    return this.goals.find((goal) => goal.id === this.form.goalId)?.name || 'General Savings';
  }

  private async loadGoals(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const goals = await this.savingsService.getGoals();
      this.goals = goals.filter((goal) => !goal.isCompleted);
      const requestedGoalId = this.route.snapshot.queryParamMap.get('goalId');
      if (requestedGoalId && this.goals.some((goal) => goal.id === requestedGoalId)) {
        this.selectGoal(requestedGoalId);
      }
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'We could not load your savings goals.';
    } finally {
      this.isLoading = false;
    }
  }

  private buildPayload(): DailySavingsPayload | null {
    const amount = this.normalizeAmount(this.form.amount);
    const currency = this.form.currency.trim().toUpperCase();
    const note = this.form.note.trim();

    if (!amount) {
      this.errorMessage = 'Please enter a positive savings amount.';
      return null;
    }

    if (!/^[A-Z]{3}$/.test(currency)) {
      this.errorMessage = 'Please choose a valid currency.';
      return null;
    }

    if (!this.form.date) {
      this.errorMessage = 'Please choose a savings date.';
      return null;
    }

    if (note.length > 240) {
      this.errorMessage = 'Notes must be 240 characters or fewer.';
      return null;
    }

    return {
      goalId: this.form.goalId || null,
      amount,
      currency,
      date: this.form.date,
      note: note || null,
    };
  }

  private normalizeAmount(value: string | number): string | null {
    const text = typeof value === 'number' ? String(value) : typeof value === 'string' ? value.trim() : '';
    return /^\d+(\.\d{1,2})?$/.test(text) && Number(text) > 0 ? text : null;
  }

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastController.create({ message, duration: 1800, position: 'bottom', color: 'success' });
    await toast.present();
  }
}
