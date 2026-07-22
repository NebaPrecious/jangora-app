import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Subject } from 'rxjs';
import { ExpensesService } from '../../../core/services/expenses.service';
import { HomePage } from './home.page';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  const refreshSubject = new Subject<number>();

  const expensesService = {
    refresh$: refreshSubject.asObservable(),
    getRecentExpenses: jasmine.createSpy('getRecentExpenses').and.resolveTo([
      {
        id: 'expense-id',
        userId: 'user-id',
        amount: '1500.00',
        currency: 'XAF',
        category: 'Food',
        date: '2026-07-21T08:00:00.000Z',
        note: 'Lunch',
        isRecurring: false,
        recurrenceType: null,
        createdAt: '2026-07-21T08:00:00.000Z',
        updatedAt: '2026-07-21T08:00:00.000Z',
      },
    ]),
    getExpenseSummary: jasmine.createSpy('getExpenseSummary').and.resolveTo({
      totalSpentThisMonth: 1500,
      transactionCountThisMonth: 1,
      spendingByCategory: [{ category: 'Food', total: 1500 }],
      previousMonthTotal: 0,
      monthOverMonthChange: 1500,
    }),
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [HomePage, RouterTestingModule],
      providers: [provideHttpClient(), { provide: ExpensesService, useValue: expensesService }],
    });

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose the main dashboard quick actions', () => {
    expect(component.quickActions.map((action) => action.label)).toEqual([
      'Add Expense',
      'Add Savings',
      'View Budget'
    ]);
  });

  it('should navigate to the profile page from the home top bar', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigateByUrl');

    component.goToProfile();

    expect(navigateSpy).toHaveBeenCalledWith('/profile');
  });

  it('should load recent expenses and monthly summary', () => {
    expect(component.monthlySpent).toBe(1500);
    expect(component.recentTransactions.length).toBe(1);
    expect(component.recentTransactions[0].category).toBe('Food');
  });

  it('should keep total balance at zero until a real balance source exists', () => {
    expect(component.totalBalance).toBe(0);
    expect(component.formatMoney(component.totalBalance)).toBe('XAF 0');
  });
});
