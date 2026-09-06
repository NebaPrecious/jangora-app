import { ComponentFixture, TestBed } from '@angular/core/testing';
import { fakeAsync, flushMicrotasks, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AiIntroductionPage } from './ai-introduction.page';
import { AuthService } from '../../../core/auth/auth.service';
import { UserPreferencesService } from '../../../core/services/user-preferences.service';
import { UserStateService } from '../../../core/services/user-state.service';
import { Subject } from 'rxjs';
import { SessionRestoreService } from '../../../core/services/session-restore.service';
import { NavigationFocusService } from '../../../core/services/navigation-focus.service';

describe('AiIntroductionPage', () => {
  let component: AiIntroductionPage;
  let fixture: ComponentFixture<AiIntroductionPage>;
  const router = { events: new Subject(), navigateByUrl: jasmine.createSpy('navigateByUrl').and.resolveTo(true) };
  const authService = {
    getCurrentUser: jasmine.createSpy('getCurrentUser').and.returnValue({ emailVerified: true }),
  };
  const sessionRestoreService = {
    restoreAuthenticatedSession: jasmine.createSpy('restoreAuthenticatedSession').and.resolveTo({
      firebaseUser: { emailVerified: true },
      backendUser: { id: 'user-id' },
      preferences: { onboardingCompleted: false },
    }),
  };
  const userStateService = {
    setUser: jasmine.createSpy('setUser'),
  };
  const userPreferencesService = {
    saveCompletedOnboardingFromLocalStorage: jasmine.createSpy('saveCompletedOnboardingFromLocalStorage').and.resolveTo({
      id: 'pref-id',
      onboardingCompleted: true,
    }),
  };
  const navigationFocusService = {
    blurActiveElement: jasmine.createSpy('blurActiveElement'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiIntroductionPage],
      providers: [
        { provide: Router, useValue: router },
        { provide: AuthService, useValue: authService },
        { provide: SessionRestoreService, useValue: sessionRestoreService },
        { provide: UserPreferencesService, useValue: userPreferencesService },
        { provide: UserStateService, useValue: userStateService },
        { provide: NavigationFocusService, useValue: navigationFocusService },
      ],
    }).compileComponents();

    router.navigateByUrl.calls.reset();
    authService.getCurrentUser.calls.reset();
    authService.getCurrentUser.and.returnValue({ emailVerified: true });
    sessionRestoreService.restoreAuthenticatedSession.calls.reset();
    sessionRestoreService.restoreAuthenticatedSession.and.resolveTo({
      firebaseUser: { emailVerified: true },
      backendUser: { id: 'user-id' },
      preferences: { onboardingCompleted: false },
    });
    userStateService.setUser.calls.reset();
    navigationFocusService.blurActiveElement.calls.reset();
    userPreferencesService.saveCompletedOnboardingFromLocalStorage.calls.reset();
    userPreferencesService.saveCompletedOnboardingFromLocalStorage.and.resolveTo({
      id: 'pref-id',
      onboardingCompleted: true,
    });
    fixture = TestBed.createComponent(AiIntroductionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('persists onboarding before navigating verified users to dashboard', fakeAsync(() => {
    void component.continue();
    tick(700);
    flushMicrotasks();

    expect(sessionRestoreService.restoreAuthenticatedSession).toHaveBeenCalledTimes(1);
    expect(userPreferencesService.saveCompletedOnboardingFromLocalStorage).toHaveBeenCalledTimes(1);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard');
    expect(component.loading).toBeFalse();
  }));

  it('does not navigate or mark completion when onboarding persistence fails', fakeAsync(() => {
    userPreferencesService.saveCompletedOnboardingFromLocalStorage.and.rejectWith(new Error('network timeout'));

    void component.continue();
    tick(700);
    flushMicrotasks();

    expect(router.navigateByUrl).not.toHaveBeenCalledWith('/dashboard');
    expect(component.errorMessage).toBe("We couldn't connect right now. Please try again.");
    expect(component.loading).toBeFalse();
  }));

  it('ignores duplicate clicks while the transition is already running', fakeAsync(() => {
    void component.continue();
    void component.continue();
    tick(700);
    flushMicrotasks();

    expect(sessionRestoreService.restoreAuthenticatedSession).toHaveBeenCalledTimes(1);
    expect(userPreferencesService.saveCompletedOnboardingFromLocalStorage).toHaveBeenCalledTimes(1);
  }));

  it('sends unauthenticated onboarding users to registration', fakeAsync(() => {
    authService.getCurrentUser.and.returnValue(null);

    void component.continue();
    tick(700);
    flushMicrotasks();

    expect(sessionRestoreService.restoreAuthenticatedSession).not.toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/register');
  }));
});
