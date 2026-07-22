import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { UserStateService } from '../../../core/services/user-state.service';
import { UserPreferencesService } from '../../../core/services/user-preferences.service';
import { Expense, ExpensesService, ExpenseSummary } from '../../../core/services/expenses.service';
import { DashboardTabsComponent } from '../../../shared/components/dashboard-tabs/dashboard-tabs.component';
import { Subscription } from 'rxjs';

import {
  IonContent,
  IonIcon,
  IonProgressBar
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  homeOutline,
  receiptOutline,
  walletOutline,
  pieChartOutline,
  chatbubbleEllipsesOutline,
  notificationsOutline,
  addOutline,
  removeOutline,
  sparklesOutline,
  trendingUpOutline,
  chevronForwardOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [
    CommonModule,
    IonContent,
    IonIcon,
    IonProgressBar,
    DashboardTabsComponent
  ]
})
export class HomePage implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly userStateService = inject(UserStateService);
  private readonly userPreferencesService = inject(UserPreferencesService);
  private readonly expensesService = inject(ExpensesService);

  userName = 'there';
  currency = localStorage.getItem('currency') || 'XAF';

  totalBalance = 0;
  monthlySpent = 0;
  monthlyBudget = 250000;
  savingsProgress = 72;
  isExpenseDataLoading = true;
  expenseDataError = '';
  expenseSummary: ExpenseSummary | null = null;
  private refreshSubscription?: Subscription;

  quickActions = [
    { label: 'Add Expense', icon: 'remove-outline', action: 'add-expense' },
    { label: 'Add Savings', icon: 'add-outline', action: 'add-savings' },
    { label: 'View Budget', icon: 'pie-chart-outline', action: 'view-budget' }
  ];

  recentTransactions: Expense[] = [];

  constructor() {
    addIcons({
      homeOutline,
      receiptOutline,
      walletOutline,
      pieChartOutline,
      chatbubbleEllipsesOutline,
      notificationsOutline,
      addOutline,
      removeOutline,
      sparklesOutline,
      trendingUpOutline,
      chevronForwardOutline
    });
  }

  async ngOnInit(): Promise<void> {
    const backendUser = this.userStateService.getUser();
    const firebaseUser = this.authService.getCurrentUser();
    const preferences = this.userPreferencesService.getPreferences();

    this.userName =
      [backendUser?.firstName, backendUser?.lastName].filter(Boolean).join(' ').trim() ||
      backendUser?.firstName ||
      firebaseUser?.displayName ||
      firebaseUser?.email?.split('@')[0] ||
      'there';

    this.currency = preferences?.preferredCurrency || localStorage.getItem('currency') || 'XAF';
    this.refreshSubscription = this.expensesService.refresh$.subscribe(() => {
      if (!this.isExpenseDataLoading) {
        void this.loadExpenseData(false);
      }
    });
    await this.loadExpenseData();
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }

  async ionViewWillEnter(): Promise<void> {
    await this.loadExpenseData(false);
  }

  get budgetUsedPercentage(): number {
    if (this.monthlyBudget === 0) return 0;
    return this.monthlySpent / this.monthlyBudget;
  }

  get budgetLeft(): number {
    return this.monthlyBudget - this.monthlySpent;
  }

  goToProfile(): void {
    void this.router.navigateByUrl('/profile');
  }

  handleQuickAction(action: string): void {
    switch (action) {
      case 'add-expense':
        void this.router.navigateByUrl('/expenses/add');
        break;
      case 'add-savings':
        void this.router.navigateByUrl('/savings');
        break;
      case 'view-budget':
        void this.router.navigateByUrl('/budget');
        break;
      default:
        break;
    }
  }

  formatMoney(amount: number): string {
    return `${this.currency || 'XAF'} ${Number(amount || 0).toLocaleString()}`;
  }

  viewAllExpenses(): void {
    void this.router.navigateByUrl('/expenses');
  }

  formatExpenseDate(date: string): string {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  }

  private async loadExpenseData(showLoading = true): Promise<void> {
    this.isExpenseDataLoading = showLoading;
    this.expenseDataError = '';

    try {
      const [recentExpenses, summary] = await Promise.all([
        this.expensesService.getRecentExpenses(),
        this.expensesService.getExpenseSummary(),
      ]);
      this.recentTransactions = recentExpenses;
      this.expenseSummary = summary;
      this.monthlySpent = summary.totalSpentThisMonth;

      if (recentExpenses[0]?.currency) {
        this.currency = recentExpenses[0].currency;
      }
    } catch {
      this.expenseDataError = 'We could not load your latest expense data.';
    } finally {
      this.isExpenseDataLoading = false;
    }
  }

}
