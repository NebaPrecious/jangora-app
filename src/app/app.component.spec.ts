import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app.component';
import { UserPreferencesService } from './core/services/user-preferences.service';
import { SessionRestoreService } from './core/services/session-restore.service';

describe('AppComponent', () => {
  const sessionRestoreService = {
    restoreAuthenticatedSession: jasmine.createSpy('restoreAuthenticatedSession').and.resolveTo({
      firebaseUser: null,
      backendUser: null,
      preferences: null,
    }),
  };
  const userPreferencesService = {
    getNextOnboardingRoute: jasmine.createSpy('getNextOnboardingRoute').and.returnValue('/goal'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        { provide: SessionRestoreService, useValue: sessionRestoreService },
        { provide: UserPreferencesService, useValue: userPreferencesService },
      ]
    }).compileComponents();

    sessionRestoreService.restoreAuthenticatedSession.calls.reset();
    sessionRestoreService.restoreAuthenticatedSession.and.resolveTo({
      firebaseUser: null,
      backendUser: null,
      preferences: null,
    });
    userPreferencesService.getNextOnboardingRoute.calls.reset();
    userPreferencesService.getNextOnboardingRoute.and.returnValue('/goal');
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the Ionic app shell', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const app = fixture.nativeElement;
    expect(app.querySelector('ion-app')).toBeTruthy();
    expect(app.querySelector('ion-router-outlet')).toBeTruthy();
  });

  it('should ask the shared session service to restore startup state once', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(sessionRestoreService.restoreAuthenticatedSession).toHaveBeenCalledTimes(1);
  });

  it('should not redirect or clear through AppComponent when restore is temporarily unavailable', async () => {
    sessionRestoreService.restoreAuthenticatedSession.and.rejectWith(new Error('network timeout'));

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(userPreferencesService.getNextOnboardingRoute).not.toHaveBeenCalled();
  });
});
