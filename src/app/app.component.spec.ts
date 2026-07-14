import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app.component';
import { AuthService } from './core/auth/auth.service';
import { ApiAuthService } from './core/services/api-auth.service';
import { UserStateService } from './core/services/user-state.service';

describe('AppComponent', () => {
  const authService = {
    waitForAuthReady: jasmine.createSpy('waitForAuthReady').and.resolveTo(null),
  };
  const apiAuthService = {
    restoreBackendUser: jasmine.createSpy('restoreBackendUser'),
  };
  const userStateService = {
    clearUser: jasmine.createSpy('clearUser'),
    setUser: jasmine.createSpy('setUser'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: ApiAuthService, useValue: apiAuthService },
        { provide: UserStateService, useValue: userStateService },
      ]
    }).compileComponents();
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

  it('should clear backend user state when Firebase has no current user', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(userStateService.clearUser).toHaveBeenCalled();
  });
});
