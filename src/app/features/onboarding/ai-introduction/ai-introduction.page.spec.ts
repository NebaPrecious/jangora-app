import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AiIntroductionPage } from './ai-introduction.page';

describe('AiIntroductionPage', () => {
  let component: AiIntroductionPage;
  let fixture: ComponentFixture<AiIntroductionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AiIntroductionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
