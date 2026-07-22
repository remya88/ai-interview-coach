import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnswerEditorComponent } from './answer-editor.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('AnswerEditorComponent', () => {
  let component: AnswerEditorComponent;
  let fixture: ComponentFixture<AnswerEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnswerEditorComponent, BrowserAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AnswerEditorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display text editor for theory questions', () => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('questionType', 'THEORY');
    });
    fixture.detectChanges();

    const textarea = fixture.nativeElement.querySelector('textarea');
    expect(textarea).toBeTruthy();

    const selectFields = fixture.nativeElement.querySelectorAll('mat-select');
    expect(selectFields.length).toBe(0); // No language selector for theory
  });

  it('should display code editor for coding questions', () => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('questionType', 'CODING');
    });
    fixture.detectChanges();

    const selectFields = fixture.nativeElement.querySelectorAll('mat-select');
    expect(selectFields.length).toBeGreaterThan(0); // Language selector present
  });

  it('should count characters', () => {
    component.answer = 'Hello World';
    expect(component.charCount()).toBe(11);
  });

  it('should count words', () => {
    component.answer = 'Hello world test';
    expect(component.wordCount()).toBe(3);
  });

  it('should count lines', () => {
    component.answer = 'Line 1\nLine 2\nLine 3';
    expect(component.lineCount()).toBe(3);
  });

  it('should validate answer', () => {
    component.answer = '';
    expect(component.isValid()).toBe(false);

    component.answer = '   ';
    expect(component.isValid()).toBe(false);

    component.answer = 'Valid answer';
    expect(component.isValid()).toBe(true);
  });

  it('should emit answered event when answer changes', () => {
    const emitSpy = jest.spyOn(component.answered, 'emit');

    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('questionType', 'THEORY');
    });
    fixture.detectChanges();

    component.answer = 'My answer';
    component.onAnswerChange();

    expect(emitSpy).toHaveBeenCalledWith('My answer');
  });

  it('should emit submit event when submit clicked', () => {
    const submitSpy = jest.spyOn(component.submit, 'emit');

    component.answer = 'Valid answer';

    const submitButton = fixture.nativeElement.querySelector('[color="primary"]');
    submitButton?.click();

    expect(submitSpy).toHaveBeenCalled();
  });

  it('should disable submit button when answer is invalid', () => {
    component.answer = '';

    fixture.detectChanges();

    const submitButton = fixture.nativeElement.querySelector('[color="primary"]');
    expect(submitButton.disabled).toBe(true);
  });

  it('should detect code questions correctly', () => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('questionType', 'CODING');
    });
    expect(component.isCodeQuestion()).toBe(true);

    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('questionType', 'DEBUGGING');
    });
    expect(component.isCodeQuestion()).toBe(true);

    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('questionType', 'THEORY');
    });
    expect(component.isCodeQuestion()).toBe(false);
  });

  it('should load initial answer from input', () => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('currentAnswer', 'Initial answer');
    });
    fixture.detectChanges();

    expect(component.answer).toBe('Initial answer');
  });
});
