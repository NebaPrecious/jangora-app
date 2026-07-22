import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ExpensesService } from './expenses.service';

describe('ExpensesService', () => {
  let service: ExpensesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ExpensesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('creates an expense through the authenticated API', async () => {
    const promise = service.createExpense({
      amount: '1000',
      currency: 'XAF',
      category: 'Food',
      date: '2026-07-21T08:00:00.000Z',
      note: 'Lunch',
      isRecurring: false,
      recurrenceType: null,
    });

    const request = httpMock.expectOne('http://localhost:3000/expenses');
    expect(request.request.method).toBe('POST');
    request.flush({ id: 'expense-id', ...request.request.body });

    await expectAsync(promise).toBeResolvedTo(jasmine.objectContaining({ id: 'expense-id' }));
  });

  it('sends search and filter requests explicitly', async () => {
    const promise = service.getExpenses({ search: 'food', category: 'Food', view: 'monthly', page: 1, limit: 20 });

    const request = httpMock.expectOne((req) => req.url === 'http://localhost:3000/expenses');
    expect(request.request.params.get('search')).toBe('food');
    expect(request.request.params.get('category')).toBe('Food');
    expect(request.request.params.get('view')).toBe('monthly');
    request.flush({ data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } });

    await expectAsync(promise).toBeResolvedTo(jasmine.objectContaining({ data: [] }));
  });

  it('maps backend failures to friendly errors', async () => {
    const promise = service.getExpenseById('missing-id');
    const request = httpMock.expectOne('http://localhost:3000/expenses/missing-id');
    request.flush({ message: 'Expense was not found.' }, { status: 404, statusText: 'Not Found' });

    await expectAsync(promise).toBeRejectedWithError('Expense was not found.');
  });
});
