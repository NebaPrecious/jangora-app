import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { VerifyEmailPage } from './verify-email.page';

describe('VerifyEmailPage', () => {
  let component: VerifyEmailPage;
  let fixture: ComponentFixture<VerifyEmailPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifyEmailPage],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(VerifyEmailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should keep the Verify button visible while resend countdown is running', () => {
    component.countdown = 30;
    fixture.detectChanges();

    const buttons = Array.from(fixture.nativeElement.querySelectorAll('ion-button'));
    expect(buttons.some((button: any) => button.textContent.includes('Verify'))).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('Resend email in 30 seconds');
  });

  it('should map Firebase verification errors to friendly messages', () => {
    expect((component as any).getFriendlyFirebaseError({ code: 'auth/network-request-failed' })).toBe(
      'Please check your internet connection.',
    );
    expect((component as any).getFriendlyFirebaseError({ code: 'auth/too-many-requests' })).toBe(
      'Too many requests were made. Please wait a few minutes before trying again.',
    );
  });
});
