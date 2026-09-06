import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Subject } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { ExpensesService } from '../../../core/services/expenses.service';
import { SavingsService } from '../../../core/services/savings.service';
import { UserPreferencesService } from '../../../core/services/user-preferences.service';
import { UserStateService } from '../../../core/services/user-state.service';
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
  const savingsRefreshSubject = new Subject<number>();
  const savingsService = {
    refresh$: savingsRefreshSubject.asObservable(),
    getGoals: jasmine.createSpy('getGoals').and.resolveTo([
      {
        id: 'goal-id',
        userId: 'user-id',
        name: 'Emergency Fund',
        targetAmount: '100000.00',
        currentAmount: '25000.00',
        currency: 'XAF',
        targetDate: null,
        isCompleted: false,
        createdAt: '2026-07-01T00:00:00.000Z',
        updatedAt: '2026-07-21T08:00:00.000Z',
      },
    ]),
    getSummary: jasmine.createSpy('getSummary').and.resolveTo({
      totalSaved: 25000,
      activeGoals: 1,
      completedGoals: 0,
      goalCompletionRate: 25,
      recentSavings: [],
      savingsOverTime: [],
      plan: { currency: 'XAF', isEnabled: false, currentStreak: 0, longestStreak: 0 },
    }),
  };
  const authService = {
    getCurrentUser: jasmine.createSpy('getCurrentUser').and.returnValue({ email: 'test@example.com', displayName: null }),
  };
  const userStateService = {
    getUser: jasmine.createSpy('getUser').and.returnValue({ firstName: 'Test', lastName: 'User', displayName: 'Test User' }),
  };
  const userPreferencesService = {
    getPreferences: jasmine.createSpy('getPreferences').and.returnValue({ preferredCurrency: 'XAF' }),
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [HomePage, RouterTestingModule],
      providers: [
        provideHttpClient(),
        { provide: AuthService, useValue: authService },
        { provide: ExpensesService, useValue: expensesService },
        { provide: SavingsService, useValue: savingsService },
        { provide: UserPreferencesService, useValue: userPreferencesService },
        { provide: UserStateService, useValue: userStateService },
      ],
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

  it('should open the combined transaction history from View all', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigateByUrl');

    component.viewAllTransactions();

    expect(navigateSpy).toHaveBeenCalledWith('/transactions');
  });
});
