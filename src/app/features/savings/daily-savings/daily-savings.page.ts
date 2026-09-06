import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonSpinner,
  IonTitle,
  IonToggle,
  IonToolbar,
  ToastController,
} from '@ionic/angular/standalone';

import { DailySavingsResponse, SavingsService } from '../../../core/services/savings.service';

@Component({
  selector: 'app-daily-savings',
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
    IonToggle,
    IonToolbar,
  ],
  templateUrl: './daily-savings.page.html',
  styleUrls: ['./daily-savings.page.scss'],
})
export class DailySavingsPage implements OnInit {
  private readonly savingsService = inject(SavingsService);
  private readonly location = inject(Location);
  private readonly toastController = inject(ToastController);

  dailyState: DailySavingsResponse | null = null;
  isLoading = true;
  isSavingSettings = false;
  isLogging = false;
  errorMessage = '';
  skipMessage = '';

  form = {
    isDailyModeEnabled: false,
    dailyTargetAmount: '',
    currency: localStorage.getItem('currency') || 'XAF',
    reminderTime: '',
    logAmount: '',
    catchUpAmount: '',
  };

  constructor() {}

  async ngOnInit(): Promise<void> {
    await this.loadDailySavings();
  }

  async ionViewWillEnter(): Promise<void> {
    await this.loadDailySavings(false);
  }

  async loadDailySavings(showLoading = true): Promise<void> {
    this.isLoading = showLoading;
    this.errorMessage = '';

    try {
      this.dailyState = await this.savingsService.getDailySavings();
      this.applyPlan();
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'We could not load daily savings.';
    } finally {
      this.isLoading = false;
    }
  }

  async saveSettings(): Promise<void> {
    if (this.isSavingSettings) return;
    this.isSavingSettings = true;
    this.errorMessage = '';

    try {
      const plan = await this.savingsService.saveDailySettings({
        isDailyModeEnabled: this.form.isDailyModeEnabled,
        dailyTargetAmount: this.normalizeNonNegativeAmount(this.form.dailyTargetAmount) || '0',
        currency: this.form.currency,
        reminderTime: this.form.reminderTime || null,
      });
      this.dailyState = this.dailyState ? { ...this.dailyState, plan } : this.dailyState;
      await this.showToast('Daily savings settings saved.');
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'We could not save daily savings settings.';
    } finally {
      this.isSavingSettings = false;
    }
  }

  async logToday(): Promise<void> {
    await this.logSavingsForDate(new Date().toISOString().slice(0, 10), this.form.logAmount || this.form.dailyTargetAmount);
  }

  async catchUpYesterday(): Promise<void> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    await this.logSavingsForDate(yesterday.toISOString().slice(0, 10), this.form.catchUpAmount || this.form.dailyTargetAmount);
  }

  skipMissedDay(): void {
    this.skipMessage = 'Skipped for now. You can catch up any time from this screen.';
  }

  goBack(): void {
    this.location.back();
  }

  formatMoney(amount: string | number, currency = this.form.currency || 'XAF'): string {
    return `${currency} ${Number(amount || 0).toLocaleString()}`;
  }

  get todaySaved(): boolean {
    return !!this.dailyState?.todaySaved;
  }

  get yesterdayNeedsCatchup(): boolean {
    if (!this.dailyState?.plan?.isEnabled || this.skipMessage) return false;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayText = yesterday.toISOString().slice(0, 10);
    return this.dailyState.entries.every((entry) => entry.date !== yesterdayText);
  }

  private async logSavingsForDate(date: string, value: string | number): Promise<void> {
    if (this.isLogging) return;
    const amount = this.normalizeAmount(value);

    if (!amount) {
      this.errorMessage = 'Please enter a positive amount to save.';
      return;
    }

    this.isLogging = true;
    this.errorMessage = '';

    try {
      await this.savingsService.addDailySavings({
        goalId: null,
        amount,
        currency: this.form.currency,
        date,
        note: date === new Date().toISOString().slice(0, 10) ? 'Daily savings' : 'Catch up savings',
      });
      this.form.logAmount = '';
      this.form.catchUpAmount = '';
      await this.loadDailySavings(false);
      await this.showToast('Daily savings logged.');
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'We could not log daily savings.';
    } finally {
      this.isLogging = false;
    }
  }

  private applyPlan(): void {
    if (!this.dailyState?.plan) return;
    const plan = this.dailyState.plan;
    this.form.isDailyModeEnabled = plan.isEnabled;
    this.form.dailyTargetAmount = plan.dailyTargetAmount === '0.00' ? '' : String(Number(plan.dailyTargetAmount));
    this.form.currency = plan.currency;
    this.form.reminderTime = plan.reminderTime || '';
  }

  private normalizeAmount(value: string | number): string | null {
    const text = typeof value === 'number' ? String(value) : typeof value === 'string' ? value.trim() : '';
    return /^\d+(\.\d{1,2})?$/.test(text) && Number(text) > 0 ? text : null;
  }

  private normalizeNonNegativeAmount(value: string | number): string | null {
    const text = typeof value === 'number' ? String(value) : typeof value === 'string' ? value.trim() : '';
    return text === '' ? '0' : /^\d+(\.\d{1,2})?$/.test(text) && Number(text) >= 0 ? text : null;
  }

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastController.create({ message, duration: 1800, position: 'bottom', color: 'success' });
    await toast.present();
  }
}
