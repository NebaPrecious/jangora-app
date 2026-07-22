import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, NavController, ToastController } from '@ionic/angular/standalone';

import { ExpensesService } from '../../../core/services/expenses.service';
import { ExpenseDetailPage } from './expense-detail.page';

describe('ExpenseDetailPage', () => {
  let component: ExpenseDetailPage;
  let fixture: ComponentFixture<ExpenseDetailPage>;
  const expense = {
    id: 'expense-id',
    userId: 'user-id',
    amount: '1000.00',
    currency: 'XAF',
    category: 'Food',
    date: '2026-07-21T08:00:00.000Z',
    note: null,
    isRecurring: false,
    recurrenceType: null,
    createdAt: '2026-07-21T08:00:00.000Z',
    updatedAt: '2026-07-21T08:00:00.000Z',
  };
  const router = { navigateByUrl: jasmine.createSpy('navigateByUrl').and.resolveTo(true) };
  const expensesService = {
    getExpenseById: jasmine.createSpy('getExpenseById').and.resolveTo(expense),
    deleteExpense: jasmine.createSpy('deleteExpense').and.resolveTo(undefined),
  };
  const alertController = {
    create: jasmine.createSpy('create').and.callFake(async (options) => {
      options.buttons[1].handler();
      return { present: jasmine.createSpy('present').and.resolveTo(undefined) };
    }),
  };
  const toastController = {
    create: jasmine.createSpy('create').and.resolveTo({ present: jasmine.createSpy('present').and.resolveTo(undefined) }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseDetailPage],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'expense-id' } } } },
        { provide: Router, useValue: router },
        { provide: ExpensesService, useValue: expensesService },
        { provide: AlertController, useValue: alertController },
        { provide: ToastController, useValue: toastController },
        { provide: NavController, useValue: { navigateBack: jasmine.createSpy('navigateBack') } },
      ],
    }).compileComponents();

    router.navigateByUrl.calls.reset();
    expensesService.deleteExpense.calls.reset();
    fixture = TestBed.createComponent(ExpenseDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('loads expense details', () => {
    expect(component.expense?.id).toBe('expense-id');
    expect(expensesService.getExpenseById).toHaveBeenCalledWith('expense-id');
  });

  it('navigates to edit flow', () => {
    component.editExpense();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/expenses/expense-id/edit');
  });

  it('confirms and deletes through the backend', async () => {
    await component.confirmDelete();
    await fixture.whenStable();

    expect(expensesService.deleteExpense).toHaveBeenCalledWith('expense-id');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/expenses');
  });
});
