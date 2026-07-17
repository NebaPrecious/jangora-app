import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { LoginPage } from './login.page';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should prevent empty email login submissions', async () => {
    await component.login();
    expect(component.errorMessage).toBe('Please enter your email and password.');
  });

  it('should show friendly Google authentication failures', () => {
    expect((component as any).getFriendlyGoogleError({ code: 'auth/popup-blocked' })).toContain(
      'blocked',
    );
    expect((component as any).getFriendlyGoogleError({ code: 'auth/account-exists-with-different-credential' })).toContain(
      'original method',
    );
  });
});
