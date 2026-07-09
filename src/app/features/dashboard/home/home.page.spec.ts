import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HomePage } from './home.page';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HomePage, RouterTestingModule],
    });

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose the main dashboard quick actions', () => {
    expect(component.quickActions.map((action) => action.label)).toEqual([
      'Add Expense',
      'Add Savings',
      'View Budget'
    ]);
  });

  it('should navigate to the profile page from the home top bar', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigateByUrl');

    component.goToProfile();

    expect(navigateSpy).toHaveBeenCalledWith('/profile');
  });
});
