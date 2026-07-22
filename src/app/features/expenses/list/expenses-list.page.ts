import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  calendarOutline,
  refreshOutline,
  removeOutline,
  receiptOutline,
  searchOutline,
  walletOutline,
} from 'ionicons/icons';
import { Subscription } from 'rxjs';

import {
  Expense,
  ExpenseCategory,
  ExpenseFilters,
  ExpenseSummary,
  ExpenseView,
  ExpensesService,
} from '../../../core/services/expenses.service';
import { DashboardTabsComponent } from '../../../shared/components/dashboard-tabs/dashboard-tabs.component';

@Component({
  selector: 'app-expenses-list',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon, IonSpinner, DashboardTabsComponent],
  templateUrl: './expenses-list.page.html',
  styleUrls: ['./expenses-list.page.scss'],
})
export class ExpensesListPage implements OnInit, OnDestroy {
  private readonly expensesService = inject(ExpensesService);
  private readonly router = inject(Router);
  private refreshSubscription?: Subscription;

  readonly categories: Array<ExpenseCategory | ''> = ['', 'Food', 'Transport', 'Bills', 'Health', 'Entertainment', 'Shopping', 'Other'];
  readonly views: ExpenseView[] = ['daily', 'weekly', 'monthly'];

  expenses: Expense[] = [];
  summary: ExpenseSummary | null = null;
  filters: ExpenseFilters = {
    search: '',
    category: '',
    view: 'monthly',
    page: 1,
    limit: 20,
  };

  isLoading = true;
  isRetrying = false;
  errorMessage = '';
  hasLoadedSuccessfully = false;
  isCategoryOpen = false;

  constructor() {
    addIcons({
      addOutline,
      calendarOutline,
      refreshOutline,
      removeOutline,
      receiptOutline,
      searchOutline,
      walletOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    this.refreshSubscription = this.expensesService.refresh$.subscribe(() => {
      if (!this.isLoading) {
        void this.loadExpenses(false);
      }
    });
    await this.loadExpenses(true);
  }

  async ionViewWillEnter(): Promise<void> {
    await this.loadExpenses(false);
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }

  async loadExpenses(showLoading = true): Promise<void> {
    this.isLoading = showLoading;
    this.isRetrying = !showLoading;
    this.errorMessage = '';

    try {
      const [expenses, summary] = await Promise.all([
        this.expensesService.getExpenses(this.filters),
        this.expensesService.getExpenseSummary(),
      ]);
      this.expenses = expenses.data;
      this.summary = summary;
      this.hasLoadedSuccessfully = true;
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'We could not load your expenses. Please try again.';
      this.hasLoadedSuccessfully = false;
    } finally {
      this.isLoading = false;
      this.isRetrying = false;
    }
  }

  toggleCategoryOptions(): void {
    this.isCategoryOpen = !this.isCategoryOpen;
  }

  selectCategory(category: ExpenseCategory | ''): void {
    this.filters.category = category;
    this.isCategoryOpen = false;
    this.applyFilters();
  }

  applyFilters(): void {
    this.filters.page = 1;
    void this.loadExpenses(false);
  }

  setView(view: ExpenseView): void {
    this.filters.view = view;
    this.applyFilters();
  }

  openExpense(expense: Expense): void {
    void this.router.navigateByUrl(`/expenses/${expense.id}`);
  }

  addExpense(): void {
    void this.router.navigateByUrl('/expenses/add');
  }

  addSavings(): void {
    void this.router.navigateByUrl('/savings');
  }

  formatMoney(amount: string | number, currency = this.expenses[0]?.currency || 'XAF'): string {
    return `${currency} ${Number(amount || 0).toLocaleString()}`;
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  }

  trackByExpenseId(_: number, expense: Expense): string {
    return expense.id;
  }
}
