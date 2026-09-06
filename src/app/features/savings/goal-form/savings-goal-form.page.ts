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

import { CreateSavingsGoalPayload, SavingsGoal, SavingsService } from '../../../core/services/savings.service';

interface SavingsGoalFormState {
  name: string;
  targetAmount: string | number;
  currency: string;
  targetDate: string;
}

@Component({
  selector: 'app-savings-goal-form',
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
  templateUrl: './savings-goal-form.page.html',
  styleUrls: ['./savings-goal-form.page.scss'],
})
export class SavingsGoalFormPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly savingsService = inject(SavingsService);
  private readonly toastController = inject(ToastController);

  readonly currencies = ['XAF', 'USD', 'EUR', 'GBP', 'NGN', 'KES', 'GHS', 'ZAR'];

  goalId: string | null = null;
  isEditMode = false;
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  isCurrencyOpen = false;

  form: SavingsGoalFormState = {
    name: '',
    targetAmount: '',
    currency: localStorage.getItem('currency') || 'XAF',
    targetDate: '',
  };

  constructor() {}

  async ngOnInit(): Promise<void> {
    this.goalId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.goalId;

    if (this.goalId) {
      await this.loadGoal(this.goalId);
    }
  }

  async save(): Promise<void> {
    if (this.isSaving) return;

    const payload = this.buildPayload();
    if (!payload) return;

    this.isSaving = true;
    this.errorMessage = '';

    try {
      if (this.isEditMode && this.goalId) {
        await this.savingsService.updateGoal(this.goalId, payload);
        await this.showToast('Savings goal updated.');
        this.location.back();
      } else {
        const goal = await this.savingsService.createGoal(payload);
        await this.showToast('Savings goal created.');
        await this.router.navigateByUrl(`/savings/goals/${goal.id}`);
      }
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'We could not save this savings goal. Please try again.';
    } finally {
      this.isSaving = false;
    }
  }

  cancel(): void {
    this.location.back();
  }

  toggleCurrency(): void {
    this.isCurrencyOpen = !this.isCurrencyOpen;
  }

  selectCurrency(currency: string): void {
    this.form.currency = currency;
    this.isCurrencyOpen = false;
  }

  private async loadGoal(id: string): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const goal = await this.savingsService.getGoalById(id);
      this.applyGoal(goal);
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'We could not load this savings goal.';
    } finally {
      this.isLoading = false;
    }
  }

  private applyGoal(goal: SavingsGoal): void {
    this.form = {
      name: goal.name,
      targetAmount: String(Number(goal.targetAmount)),
      currency: goal.currency,
      targetDate: goal.targetDate || '',
    };
  }

  private buildPayload(): CreateSavingsGoalPayload | null {
    const name = this.form.name.trim();
    const targetAmount = this.normalizeAmount(this.form.targetAmount);
    const currency = this.form.currency.trim().toUpperCase();

    if (name.length < 2) {
      this.errorMessage = 'Please give this goal a clear name.';
      return null;
    }

    if (name.length > 80) {
      this.errorMessage = 'Savings goal name must be 80 characters or fewer.';
      return null;
    }

    if (!targetAmount) {
      this.errorMessage = 'Please enter a positive savings target.';
      return null;
    }

    if (!/^[A-Z]{3}$/.test(currency)) {
      this.errorMessage = 'Please choose a valid currency.';
      return null;
    }

    return {
      name,
      targetAmount,
      currency,
      targetDate: this.form.targetDate || null,
    };
  }

  private normalizeAmount(value: string | number): string | null {
    const text = typeof value === 'number' ? String(value) : typeof value === 'string' ? value.trim() : '';
    return /^\d+(\.\d{1,2})?$/.test(text) && Number(text) > 0 ? text : null;
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
