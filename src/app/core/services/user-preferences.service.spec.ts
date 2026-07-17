import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { UserPreferencesService } from './user-preferences.service';

describe('UserPreferencesService', () => {
  let service: UserPreferencesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(UserPreferencesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should load authenticated user preferences into state', async () => {
    const promise = service.getMyPreferences();

    const request = httpMock.expectOne('http://localhost:3000/user-preferences/me');
    expect(request.request.method).toBe('GET');
    request.flush({
      id: 'pref-id',
      primaryGoals: ['Save More'],
      preferredCurrency: 'XAF',
      incomeRange: '100,000 - 300,000',
      notificationPreferences: [],
      onboardingCompleted: true,
    });

    await expectAsync(promise).toBeResolvedTo(jasmine.objectContaining({ onboardingCompleted: true }));
    expect(service.getPreferences()?.primaryGoals).toEqual(['Save More']);
  });

  it('should map local onboarding values for backend persistence', () => {
    localStorage.setItem('primaryGoals', JSON.stringify(['Save More']));
    localStorage.setItem('currency', 'USD');
    localStorage.setItem('incomeRange', 'Under 100,000');
    localStorage.setItem('notifications', JSON.stringify(['Smart Reminders']));

    expect(service.buildOnboardingPayload(true)).toEqual({
      primaryGoals: ['Save More'],
      preferredCurrency: 'USD',
      incomeRange: 'Under 100,000',
      notificationPreferences: ['Smart Reminders'],
      onboardingCompleted: true,
    });
  });
});
