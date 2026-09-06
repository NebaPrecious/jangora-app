import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowDownCircleOutline,
  arrowUpCircleOutline,
  chevronForwardOutline,
  refreshOutline,
  receiptOutline,
  walletOutline,
} from 'ionicons/icons';
import { Subscription } from 'rxjs';

import { Expense, ExpensesService } from '../../../core/services/expenses.service';
import { DailySavings, SavingsGoal, SavingsService } from '../../../core/services/savings.service';
import { DashboardTabsComponent } from '../../../shared/components/dashboard-tabs/dashboard-tabs.component';

type TransactionFilter = 'all' | 'expenses' | 'savings';

interface TransactionItem {
  id: string;
  type: 'expense' | 'savings';
  amount: string;
  currency: string;
  date: string;
  categoryOrGoal: string;
  note: string | null;
  expenseId?: string;
  goalId?: string | null;
}

@Component({
  selector: 'app-transactions-history',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, IonSpinner, DashboardTabsComponent],
  templateUrl: './transactions-history.page.html',
  styleUrls: ['./transactions-history.page.scss'],
})
export class TransactionsHistoryPage implements OnInit, OnDestroy {
  private readonly expensesService = inject(ExpensesService);
  private readonly savingsService = inject(SavingsService);
  private readonly router = inject(Router);
  private expenseRefreshSubscription?: Subscription;
  private savingsRefreshSubscription?: Subscription;

  readonly filters: TransactionFilter[] = ['all', 'expenses', 'savings'];

  activeFilter: TransactionFilter = 'all';
  transactions: TransactionItem[] = [];
  isLoading = true;
  isRetrying = false;
  errorMessage = '';

  constructor() {
    addIcons({
      arrowDownCircleOutline,
      arrowUpCircleOutline,
      chevronForwardOutline,
      refreshOutline,
      receiptOutline,
      walletOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    this.expenseRefreshSubscription = this.expensesService.refresh$.subscribe(() => {
      if (!this.isLoading) {
        void this.loadTransactions(false);
      }
    });
    this.savingsRefreshSubscription = this.savingsService.refresh$.subscribe(() => {
      if (!this.isLoading) {
        void this.loadTransactions(false);
      }
    });
    await this.loadTransactions(true);
  }

  async ionViewWillEnter(): Promise<void> {
    await this.loadTransactions(false);
  }

  ngOnDestroy(): void {
    this.expenseRefreshSubscription?.unsubscribe();
    this.savingsRefreshSubscription?.unsubscribe();
  }

  get visibleTransactions(): TransactionItem[] {
    if (this.activeFilter === 'expenses') {
      return this.transactions.filter((transaction) => transaction.type === 'expense');
    }

    if (this.activeFilter === 'savings') {
      return this.transactions.filter((transaction) => transaction.type === 'savings');
    }

    return this.transactions;
  }

  async loadTransactions(showLoading = true): Promise<void> {
    this.isLoading = showLoading;
    this.isRetrying = !showLoading;
    this.errorMessage = '';

    try {
      const [expenses, dailySavings, goals] = await Promise.all([
        this.expensesService.getExpenses({ page: 1, limit: 50 }),
        this.savingsService.getDailySavings(),
        this.savingsService.getGoals(),
      ]);
      this.transactions = [
        ...expenses.data.map((expense) => this.mapExpense(expense)),
        ...dailySavings.entries.map((entry) => this.mapSavings(entry, goals)),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'We could not load your transaction history. Please try again.';
    } finally {
      this.isLoading = false;
      this.isRetrying = false;
    }
  }

  setFilter(filter: TransactionFilter): void {
    this.activeFilter = filter;
  }

  openTransaction(transaction: TransactionItem): void {
    if (transaction.type === 'expense' && transaction.expenseId) {
      void this.router.navigateByUrl(`/expenses/${transaction.expenseId}`);
      return;
    }

    if (transaction.type === 'savings' && transaction.goalId) {
      void this.router.navigateByUrl(`/savings/goals/${transaction.goalId}`);
      return;
    }

    void this.router.navigateByUrl('/savings');
  }

  filterLabel(filter: TransactionFilter): string {
    return filter === 'all' ? 'All' : filter[0].toUpperCase() + filter.slice(1);
  }

  formatMoney(transaction: TransactionItem): string {
    const sign = transaction.type === 'expense' ? '-' : '+';
    return `${sign}${transaction.currency} ${Number(transaction.amount || 0).toLocaleString()}`;
  }

  formatDateTime(date: string): string {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(date));
  }

  trackByTransactionId(_: number, transaction: TransactionItem): string {
    return `${transaction.type}-${transaction.id}`;
  }

  private mapExpense(expense: Expense): TransactionItem {
    return {
      id: expense.id,
      type: 'expense',
      amount: expense.amount,
      currency: expense.currency,
      date: expense.date,
      categoryOrGoal: expense.category,
      note: expense.note,
      expenseId: expense.id,
    };
  }

  private mapSavings(entry: DailySavings, goals: SavingsGoal[]): TransactionItem {
    return {
      id: entry.id,
      type: 'savings',
      amount: entry.amount,
      currency: entry.currency,
      date: entry.date,
      categoryOrGoal: goals.find((goal) => goal.id === entry.goalId)?.name || 'General Savings',
      note: entry.note,
      goalId: entry.goalId,
    };
  }
}
