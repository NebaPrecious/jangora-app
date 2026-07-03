import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CurrencyPage } from './currency.page';

describe('CurrencyPage', () => {
  let component: CurrencyPage;
  let fixture: ComponentFixture<CurrencyPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrencyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
