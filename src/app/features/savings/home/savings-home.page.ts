import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonIcon, IonProgressBar, IonSpinner, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  calendarOutline,
  checkmarkCircleOutline,
  refreshOutline,
  walletOutline,
} from 'ionicons/icons';
import { Subscription } from 'rxjs';

import { DailySavings, SavingsGoal, SavingsService, SavingsSummary } from '../../../core/services/savings.service';
import { DashboardTabsComponent } from '../../../shared/components/dashboard-tabs/dashboard-tabs.component';

@Component({
  selector: 'app-savings-home',
  standalone: true,
  imports: [CommonModule, IonBackButton, IonButtons, IonContent, IonHeader, IonIcon, IonProgressBar, IonSpinner, IonToolbar, DashboardTabsComponent],
  templateUrl: './savings-home.page.html',
  styleUrls: ['./savings-home.page.scss'],
})
export class SavingsHomePage implements OnInit, OnDestroy {
  private readonly savingsService = inject(SavingsService);
  private readonly router = inject(Router);
  private refreshSubscription?: Subscription;

  goals: SavingsGoal[] = [];
  summary: SavingsSummary | null = null;
  isLoading = true;
  isRetrying = false;
  errorMessage = '';
  hasLoadedSuccessfully = false;

  constructor() {
    addIcons({
      addOutline,
      calendarOutline,
      checkmarkCircleOutline,
      refreshOutline,
      walletOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    this.refreshSubscription = this.savingsService.refresh$.subscribe(() => {
      if (!this.isLoading) {
        void this.loadSavings(false);
      }
    });
    await this.loadSavings(true);
  }

  async ionViewWillEnter(): Promise<void> {
    await this.loadSavings(false);
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }

  async loadSavings(showLoading = true): Promise<void> {
    this.isLoading = showLoading;
    this.isRetrying = !showLoading;
    this.errorMessage = '';

    try {
      const [goals, summary] = await Promise.all([this.savingsService.getGoals(), this.savingsService.getSummary()]);
      this.goals = goals;
      this.summary = summary;
      this.hasLoadedSuccessfully = true;
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'We could not load your savings. Please try again.';
      this.hasLoadedSuccessfully = false;
    } finally {
      this.isLoading = false;
      this.isRetrying = false;
    }
  }

  createGoal(): void {
    void this.router.navigateByUrl('/savings/goals/new');
  }

  addSavings(): void {
    void this.router.navigateByUrl('/savings/add');
  }

  openDailySavings(): void {
    void this.router.navigateByUrl('/savings/daily');
  }

  openGoal(goal: SavingsGoal): void {
    void this.router.navigateByUrl(`/savings/goals/${goal.id}`);
  }

  progress(goal: SavingsGoal): number {
    const target = Number(goal.targetAmount || 0);
    if (!target) return 0;
    return Math.max(0, Math.min(Number(goal.currentAmount || 0) / target, 1));
  }

  progressLabel(goal: SavingsGoal): number {
    return Math.round(this.progress(goal) * 100);
  }

  formatMoney(amount: string | number, currency = this.goals[0]?.currency || this.summary?.plan?.currency || 'XAF'): string {
    return `${currency} ${Number(amount || 0).toLocaleString()}`;
  }

  formatDate(date: string | null): string {
    if (!date) return 'No target date';
    return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date));
  }

  formatEntry(entry: DailySavings): string {
    return `${this.formatDate(entry.date)}${entry.note ? ' · ' + entry.note : ''}`;
  }

  trackByGoalId(_: number, goal: SavingsGoal): string {
    return goal.id;
  }

  trackByEntryId(_: number, entry: DailySavings): string {
    return entry.id;
  }
}
