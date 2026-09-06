import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular/standalone';
import { Subject } from 'rxjs';

import { SavingsService } from '../../../core/services/savings.service';
import { AddSavingsPage } from './add-savings.page';

describe('AddSavingsPage', () => {
  let component: AddSavingsPage;
  let fixture: ComponentFixture<AddSavingsPage>;
  const savingsService = {
    getGoals: jasmine.createSpy('getGoals').and.resolveTo([
      {
        id: 'active-goal',
        userId: 'user-id',
        name: 'Emergency Fund',
        targetAmount: '100000.00',
        currentAmount: '10000.00',
        currency: 'XAF',
        targetDate: null,
        isCompleted: false,
        createdAt: '2026-07-01T00:00:00.000Z',
        updatedAt: '2026-07-21T08:00:00.000Z',
      },
      {
        id: 'completed-goal',
        userId: 'user-id',
        name: 'Laptop',
        targetAmount: '400000.00',
        currentAmount: '400000.00',
        currency: 'XAF',
        targetDate: null,
        isCompleted: true,
        createdAt: '2026-07-01T00:00:00.000Z',
        updatedAt: '2026-07-21T08:00:00.000Z',
      },
    ]),
    addGoalDeposit: jasmine.createSpy('addGoalDeposit').and.resolveTo({ goal: {}, entry: {} }),
    addDailySavings: jasmine.createSpy('addDailySavings').and.resolveTo({ id: 'entry-id' }),
  };
  const router = { events: new Subject(), navigateByUrl: jasmine.createSpy('navigateByUrl') };
  const toastController = {
    create: jasmine.createSpy('create').and.resolveTo({ present: jasmine.createSpy('present').and.resolveTo(undefined) }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSavingsPage],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => null } } } },
        { provide: Location, useValue: { back: jasmine.createSpy('back'), subscribe: () => ({ unsubscribe: () => undefined }) } },
        { provide: Router, useValue: router },
        { provide: SavingsService, useValue: savingsService },
        { provide: ToastController, useValue: toastController },
      ],
    }).compileComponents();

    savingsService.getGoals.calls.reset();
    savingsService.addGoalDeposit.calls.reset();
    savingsService.addDailySavings.calls.reset();
    router.navigateByUrl.calls.reset();
    fixture = TestBed.createComponent(AddSavingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('shows active goals plus General Savings only', () => {
    expect(component.goals.map((goal) => goal.id)).toEqual(['active-goal']);
    expect(component.selectedGoalName()).toBe('General Savings');
  });

  it('saves a selected goal deposit and returns to savings', async () => {
    component.selectGoal('active-goal');
    component.form.amount = '5000';
    component.form.date = '2026-07-22';

    await component.save();

    expect(savingsService.addGoalDeposit).toHaveBeenCalledWith('active-goal', jasmine.objectContaining({ amount: '5000' }));
    expect(savingsService.addDailySavings).not.toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/savings');
  });
});
