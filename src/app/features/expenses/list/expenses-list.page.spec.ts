import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { ExpensesService } from '../../../core/services/expenses.service';
import { ExpensesListPage } from './expenses-list.page';

describe('ExpensesListPage', () => {
  let component: ExpensesListPage;
  let fixture: ComponentFixture<ExpensesListPage>;
  const refreshSubject = new BehaviorSubject<number>(0);
  const expensesService = {
    refresh$: refreshSubject.asObservable(),
    getExpenses: jasmine.createSpy('getExpenses').and.resolveTo({
      data: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
    }),
    getExpenseSummary: jasmine.createSpy('getExpenseSummary').and.resolveTo({
      totalSpentThisMonth: 0,
      transactionCountThisMonth: 0,
      spendingByCategory: [],
      previousMonthTotal: 0,
      monthOverMonthChange: 0,
    }),
  };
  const router = { url: '/expenses', navigateByUrl: jasmine.createSpy('navigateByUrl') };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensesListPage],
      providers: [
        { provide: ExpensesService, useValue: expensesService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    expensesService.getExpenses.calls.reset();
    router.navigateByUrl.calls.reset();
    fixture = TestBed.createComponent(ExpensesListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('loads expenses and shows the empty state model', () => {
    expect(component.isLoading).toBeFalse();
    expect(component.expenses).toEqual([]);
    expect(component.summary?.totalSpentThisMonth).toBe(0);
  });

  it('sends search and filter values when filters change', async () => {
    component.filters.search = 'food';
    component.filters.category = 'Food';
    component.applyFilters();
    await fixture.whenStable();

    expect(expensesService.getExpenses).toHaveBeenCalledWith(jasmine.objectContaining({ search: 'food', category: 'Food' }));
  });

  it('navigates add expense and add savings actions', () => {
    component.addExpense();
    component.addSavings();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/expenses/add');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/savings');
  });
});
