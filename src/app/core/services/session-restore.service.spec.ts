import { TestBed } from '@angular/core/testing';
import { AuthService } from '../auth/auth.service';
import { ApiAuthService } from './api-auth.service';
import { UserPreferencesService } from './user-preferences.service';
import { UserStateService } from './user-state.service';
import { SessionRestoreService } from './session-restore.service';

describe('SessionRestoreService', () => {
  let service: SessionRestoreService;
  const authService = {
    waitForAuthReady: jasmine.createSpy('waitForAuthReady'),
  };
  const apiAuthService = {
    restoreBackendUser: jasmine.createSpy('restoreBackendUser'),
  };
  const userStateService = {
    getUser: jasmine.createSpy('getUser'),
    setUser: jasmine.createSpy('setUser'),
    clearUser: jasmine.createSpy('clearUser'),
  };
  const userPreferencesService = {
    getPreferences: jasmine.createSpy('getPreferences'),
    getMyPreferences: jasmine.createSpy('getMyPreferences'),
    clearPreferences: jasmine.createSpy('clearPreferences'),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SessionRestoreService,
        { provide: AuthService, useValue: authService },
        { provide: ApiAuthService, useValue: apiAuthService },
        { provide: UserStateService, useValue: userStateService },
        { provide: UserPreferencesService, useValue: userPreferencesService },
      ],
    });

    authService.waitForAuthReady.calls.reset();
    apiAuthService.restoreBackendUser.calls.reset();
    userStateService.getUser.calls.reset();
    userStateService.setUser.calls.reset();
    userStateService.clearUser.calls.reset();
    userPreferencesService.getPreferences.calls.reset();
    userPreferencesService.getMyPreferences.calls.reset();
    userPreferencesService.clearPreferences.calls.reset();
    service = TestBed.inject(SessionRestoreService);
  });

  it('clears local backend state when Firebase has no current user', async () => {
    authService.waitForAuthReady.and.resolveTo(null);

    await expectAsync(service.restoreAuthenticatedSession()).toBeResolvedTo({
      firebaseUser: null,
      backendUser: null,
      preferences: null,
    });

    expect(userStateService.clearUser).toHaveBeenCalledTimes(1);
    expect(userPreferencesService.clearPreferences).toHaveBeenCalledTimes(1);
    expect(apiAuthService.restoreBackendUser).not.toHaveBeenCalled();
  });

  it('shares one in-flight backend restore across concurrent callers', async () => {
    authService.waitForAuthReady.and.resolveTo({ emailVerified: true });
    userStateService.getUser.and.returnValue(null);
    userPreferencesService.getPreferences.and.returnValue(null);
    apiAuthService.restoreBackendUser.and.returnValue(
      new Promise((resolve) => setTimeout(() => resolve({ id: 'backend-user' }), 20)),
    );
    userPreferencesService.getMyPreferences.and.resolveTo({ id: 'preferences', onboardingCompleted: true });

    const [first, second] = await Promise.all([
      service.restoreAuthenticatedSession(),
      service.restoreAuthenticatedSession(),
    ]);

    expect(first.backendUser).toEqual({ id: 'backend-user' } as never);
    expect(second.backendUser).toEqual({ id: 'backend-user' } as never);
    expect(apiAuthService.restoreBackendUser).toHaveBeenCalledTimes(1);
    expect(userPreferencesService.getMyPreferences).toHaveBeenCalledTimes(1);
  });

  it('reuses existing user and preferences without another backend call', async () => {
    authService.waitForAuthReady.and.resolveTo({ emailVerified: true });
    userStateService.getUser.and.returnValue({ id: 'cached-user' });
    userPreferencesService.getPreferences.and.returnValue({ id: 'cached-preferences', onboardingCompleted: true });

    const result = await service.restoreAuthenticatedSession();

    expect(result.backendUser).toEqual({ id: 'cached-user' } as never);
    expect(result.preferences).toEqual({ id: 'cached-preferences', onboardingCompleted: true } as never);
    expect(apiAuthService.restoreBackendUser).not.toHaveBeenCalled();
    expect(userPreferencesService.getMyPreferences).not.toHaveBeenCalled();
  });
});
