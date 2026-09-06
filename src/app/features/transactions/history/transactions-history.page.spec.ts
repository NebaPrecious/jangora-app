import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { ExpensesService } from '../../../core/services/expenses.service';
import { SavingsService } from '../../../core/services/savings.service';
import { TransactionsHistoryPage } from './transactions-history.page';

describe('TransactionsHistoryPage', () => {
  let component: TransactionsHistoryPage;
  let fixture: ComponentFixture<TransactionsHistoryPage>;
  const expenseRefresh$ = new BehaviorSubject<number>(0);
  const savingsRefresh$ = new BehaviorSubject<number>(0);
  const expensesService = {
    refresh$: expenseRefresh$.asObservable(),
    getExpenses: jasmine.createSpy('getExpenses').and.resolveTo({
      data: [
        {
          id: 'expense-1',
          userId: 'user-1',
          amount: '1200.00',
          currency: 'XAF',
          category: 'Food',
          date: '2026-07-20T10:00:00.000Z',
          note: 'Lunch',
          isRecurring: false,
          recurrenceType: null,
          createdAt: '2026-07-20T10:00:00.000Z',
          updatedAt: '2026-07-20T10:00:00.000Z',
        },
      ],
      meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
    }),
  };
  const savingsService = {
    refresh$: savingsRefresh$.asObservable(),
    getDailySavings: jasmine.createSpy('getDailySavings').and.resolveTo({
      plan: null,
      entries: [
        {
          id: 'saving-1',
          userId: 'user-1',
          goalId: 'goal-1',
          date: '2026-07-21T09:00:00.000Z',
          amount: '5000.00',
          currency: 'XAF',
          note: 'Deposit',
          createdAt: '2026-07-21T09:00:00.000Z',
        },
      ],
      todaySaved: true,
    }),
    getGoals: jasmine.createSpy('getGoals').and.resolveTo([
      {
        id: 'goal-1',
        userId: 'user-1',
        name: 'Emergency Fund',
        targetAmount: '100000.00',
        currentAmount: '5000.00',
        currency: 'XAF',
        targetDate: null,
        isCompleted: false,
        createdAt: '2026-07-01T00:00:00.000Z',
        updatedAt: '2026-07-21T09:00:00.000Z',
      },
    ]),
  };
  const router = { url: '/transactions', navigateByUrl: jasmine.createSpy('navigateByUrl') };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionsHistoryPage],
      providers: [
        { provide: ExpensesService, useValue: expensesService },
        { provide: SavingsService, useValue: savingsService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    expensesService.getExpenses.calls.reset();
    savingsService.getDailySavings.calls.reset();
    savingsService.getGoals.calls.reset();
    router.navigateByUrl.calls.reset();
    fixture = TestBed.createComponent(TransactionsHistoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('combines expenses and savings newest first', () => {
    expect(component.transactions.map((transaction) => transaction.id)).toEqual(['saving-1', 'expense-1']);
    expect(component.transactions[0].categoryOrGoal).toBe('Emergency Fund');
  });

  it('filters by transaction type', () => {
    component.setFilter('expenses');

    expect(component.visibleTransactions.length).toBe(1);
    expect(component.visibleTransactions[0].type).toBe('expense');
  });

  it('opens expense and savings targets', () => {
    component.openTransaction(component.transactions[1]);
    component.openTransaction(component.transactions[0]);

    expect(router.navigateByUrl).toHaveBeenCalledWith('/expenses/expense-1');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/savings/goals/goal-1');
  });
});
