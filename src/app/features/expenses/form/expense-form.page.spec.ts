import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular/standalone';

import { ExpensesService } from '../../../core/services/expenses.service';
import { UserPreferencesService } from '../../../core/services/user-preferences.service';
import { ExpenseFormPage } from './expense-form.page';

describe('ExpenseFormPage', () => {
  let component: ExpenseFormPage;
  let fixture: ComponentFixture<ExpenseFormPage>;
  const router = { navigateByUrl: jasmine.createSpy('navigateByUrl').and.resolveTo(true) };
  const expensesService = {
    createExpense: jasmine.createSpy('createExpense').and.resolveTo({ id: 'expense-id' }),
    updateExpense: jasmine.createSpy('updateExpense').and.resolveTo({ id: 'expense-id' }),
    getExpenseById: jasmine.createSpy('getExpenseById'),
  };
  const preferencesService = {
    getPreferences: jasmine.createSpy('getPreferences').and.returnValue({ preferredCurrency: 'XAF' }),
    getMyPreferences: jasmine.createSpy('getMyPreferences'),
  };
  const toastController = {
    create: jasmine.createSpy('create').and.resolveTo({ present: jasmine.createSpy('present').and.resolveTo(undefined) }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseFormPage],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
        { provide: Router, useValue: router },
        { provide: ExpensesService, useValue: expensesService },
        { provide: UserPreferencesService, useValue: preferencesService },
        { provide: ToastController, useValue: toastController },
        { provide: NavController, useValue: { navigateBack: jasmine.createSpy('navigateBack') } },
      ],
    }).compileComponents();

    router.navigateByUrl.calls.reset();
    expensesService.createExpense.and.resolveTo({ id: 'expense-id' });
    expensesService.updateExpense.and.resolveTo({ id: 'expense-id' });
    expensesService.createExpense.calls.reset();
    expensesService.updateExpense.calls.reset();
    fixture = TestBed.createComponent(ExpenseFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('validates positive amounts', async () => {
    component.form.amount = '0';
    await component.save();

    expect(component.errorMessage).toBe('Please enter a positive amount.');
    expect(expensesService.createExpense).not.toHaveBeenCalled();
  });

  it('clears recurrence type when recurring is disabled', async () => {
    component.form.amount = '1000';
    component.form.isRecurring = false;
    component.form.recurrenceType = 'Weekly';

    await component.save();

    expect(expensesService.createExpense).toHaveBeenCalledWith(jasmine.objectContaining({ recurrenceType: null }));
  });

  it('creates an expense and returns to the list', async () => {
    component.form.amount = '1500';
    component.form.note = 'Lunch';

    await component.save();

    expect(expensesService.createExpense).toHaveBeenCalledWith(jasmine.objectContaining({ amount: '1500', note: 'Lunch' }));
    expect(router.navigateByUrl).toHaveBeenCalledWith('/expenses');
  });

  it('handles numeric amount values from number inputs without crashing', async () => {
    component.form.amount = 1500;

    await component.save();

    expect(component.errorMessage).toBe('');
    expect(expensesService.createExpense).toHaveBeenCalledWith(jasmine.objectContaining({ amount: '1500' }));
  });

  it('prevents duplicate submissions while saving', async () => {
    let resolveCreate: (value: unknown) => void = () => undefined;
    expensesService.createExpense.and.returnValue(new Promise((resolve) => {
      resolveCreate = resolve;
    }));
    component.form.amount = '1500';

    const firstSave = component.save();
    const secondSave = component.save();
    resolveCreate({ id: 'expense-id' });
    await firstSave;
    await secondSave;

    expect(expensesService.createExpense).toHaveBeenCalledTimes(1);
  });

  it('preserves form values after creation failure', async () => {
    expensesService.createExpense.and.rejectWith(new Error('We could not save this expense. Please try again.'));
    component.form.amount = '2200';
    component.form.note = 'Dinner';

    await component.save();

    expect(component.form.amount).toBe('2200');
    expect(component.form.note).toBe('Dinner');
    expect(component.errorMessage).toContain('could not save');
  });
});
