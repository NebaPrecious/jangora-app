import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { SavingsService } from './savings.service';

describe('SavingsService', () => {
  let service: SavingsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(SavingsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('creates a savings goal through the authenticated API', async () => {
    const promise = service.createGoal({
      name: 'Emergency fund',
      targetAmount: '100000',
      currency: 'XAF',
      targetDate: null,
    });

    const request = httpMock.expectOne('http://localhost:3000/savings/goals');
    expect(request.request.method).toBe('POST');
    request.flush({
      id: 'goal-id',
      userId: 'user-id',
      currentAmount: '0.00',
      isCompleted: false,
      createdAt: '2026-07-22T00:00:00.000Z',
      updatedAt: '2026-07-22T00:00:00.000Z',
      ...request.request.body,
    });

    await expectAsync(promise).toBeResolvedTo(jasmine.objectContaining({ id: 'goal-id' }));
  });

  it('adds a goal deposit with the backend response shape', async () => {
    const promise = service.addGoalDeposit('goal-id', {
      amount: '5000',
      currency: 'XAF',
      date: '2026-07-22',
      note: 'Payday',
    });

    const request = httpMock.expectOne('http://localhost:3000/savings/goals/goal-id/deposits');
    expect(request.request.method).toBe('POST');
    request.flush({
      goal: { id: 'goal-id', currentAmount: '5000.00' },
      entry: { id: 'entry-id', goalId: 'goal-id', amount: '5000.00' },
    });

    await expectAsync(promise).toBeResolvedTo(jasmine.objectContaining({
      goal: jasmine.objectContaining({ id: 'goal-id' }),
      entry: jasmine.objectContaining({ id: 'entry-id' }),
    }));
  });

  it('saves daily settings and daily entries on the shared daily endpoint', async () => {
    const settingsPromise = service.saveDailySettings({
      isDailyModeEnabled: true,
      dailyTargetAmount: '500',
      currency: 'XAF',
      reminderTime: '08:30',
    });
    const settingsRequest = httpMock.expectOne('http://localhost:3000/savings/daily');
    expect(settingsRequest.request.method).toBe('POST');
    settingsRequest.flush({ id: 'plan-id', isEnabled: true, dailyTargetAmount: '500.00' });
    await expectAsync(settingsPromise).toBeResolvedTo(jasmine.objectContaining({ id: 'plan-id' }));

    const entryPromise = service.addDailySavings({
      goalId: null,
      amount: '500',
      currency: 'XAF',
      date: '2026-07-22',
      note: null,
    });
    const entryRequest = httpMock.expectOne('http://localhost:3000/savings/daily');
    expect(entryRequest.request.method).toBe('POST');
    entryRequest.flush({ id: 'entry-id', goalId: null, amount: '500.00' });
    await expectAsync(entryPromise).toBeResolvedTo(jasmine.objectContaining({ id: 'entry-id' }));
  });

  it('maps backend failures to friendly errors', async () => {
    const promise = service.getGoalById('missing-id');
    const request = httpMock.expectOne('http://localhost:3000/savings/goals/missing-id');
    request.flush({ message: 'Savings goal was not found.' }, { status: 404, statusText: 'Not Found' });

    await expectAsync(promise).toBeRejectedWithError('Savings goal was not found.');
  });
});
