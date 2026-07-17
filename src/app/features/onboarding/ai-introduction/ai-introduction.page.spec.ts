import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { AiIntroductionPage } from './ai-introduction.page';

describe('AiIntroductionPage', () => {
  let component: AiIntroductionPage;
  let fixture: ComponentFixture<AiIntroductionPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiIntroductionPage, RouterTestingModule],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(AiIntroductionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
