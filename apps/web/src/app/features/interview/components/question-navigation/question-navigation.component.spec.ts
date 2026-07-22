import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionNavigationComponent } from './question-navigation.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('QuestionNavigationComponent', () => {
  let component: QuestionNavigationComponent;
  let fixture: ComponentFixture<QuestionNavigationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionNavigationComponent, BrowserAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionNavigationComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display question count', () => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('currentQuestion', 3);
      fixture.componentRef.setInput('totalQuestions', 10);
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('3 of 10');
  });

  it('should enable next button when not last question', () => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('canGoNext', true);
      fixture.componentRef.setInput('currentQuestion', 1);
      fixture.componentRef.setInput('totalQuestions', 10);
    });
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    const nextButton = buttons[buttons.length - 1];
    expect(nextButton.disabled).toBe(false);
  });

  it('should disable next button when on last question', () => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('canGoNext', false);
    });
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    const nextButton = buttons[buttons.length - 1];
    expect(nextButton.disabled).toBe(true);
  });

  it('should enable previous button when not first question', () => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('canGoPrevious', true);
    });
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    const prevButton = buttons[0];
    expect(prevButton.disabled).toBe(false);
  });

  it('should disable previous button when on first question', () => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('canGoPrevious', false);
    });
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    const prevButton = buttons[0];
    expect(prevButton.disabled).toBe(true);
  });

  it('should emit next event when next button clicked', () => {
    const nextSpy = jest.spyOn(component.next, 'emit');

    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('canGoNext', true);
    });
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    buttons[buttons.length - 1].click();

    expect(nextSpy).toHaveBeenCalled();
  });

  it('should emit previous event when previous button clicked', () => {
    const previousSpy = jest.spyOn(component.previous, 'emit');

    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('canGoPrevious', true);
    });
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    buttons[0].click();

    expect(previousSpy).toHaveBeenCalled();
  });
});
