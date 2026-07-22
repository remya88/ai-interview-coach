import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InterviewProgressComponent } from './interview-progress.component';

describe('InterviewProgressComponent', () => {
  let component: InterviewProgressComponent;
  let fixture: ComponentFixture<InterviewProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewProgressComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InterviewProgressComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display progress bar with correct percentage', () => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('currentQuestion', 5);
      fixture.componentRef.setInput('totalQuestions', 10);
      fixture.componentRef.setInput('answeredQuestions', 5);
    });
    fixture.detectChanges();

    const progressBar = fixture.nativeElement.querySelector('mat-progress-bar');
    expect(progressBar.getAttribute('aria-valuenow')).toBe('50');
  });

  it('should display question count', () => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('currentQuestion', 3);
      fixture.componentRef.setInput('totalQuestions', 10);
      fixture.componentRef.setInput('answeredQuestions', 3);
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('3 / 10 answered');
  });

  it('should calculate progress percentage', () => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('currentQuestion', 2);
      fixture.componentRef.setInput('totalQuestions', 5);
      fixture.componentRef.setInput('answeredQuestions', 2);
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('40%');
  });

  it('should show 0% when no questions answered', () => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('answeredQuestions', 0);
      fixture.componentRef.setInput('totalQuestions', 10);
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('0%');
  });

  it('should show question indicators', () => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('currentQuestion', 2);
      fixture.componentRef.setInput('totalQuestions', 5);
      fixture.componentRef.setInput('answeredQuestions', 1);
    });
    fixture.detectChanges();

    const indicators = fixture.nativeElement.querySelectorAll('.rounded-full');
    expect(indicators.length).toBe(5);
  });
});
