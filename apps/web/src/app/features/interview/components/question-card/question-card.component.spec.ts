import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionCardComponent } from './question-card.component';
import { InterviewQuestion } from '../../models/interview-session.model';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('QuestionCardComponent', () => {
  let component: QuestionCardComponent;
  let fixture: ComponentFixture<QuestionCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionCardComponent, BrowserAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display question number and total', () => {
    const question: InterviewQuestion = {
      id: 'q1',
      questionNumber: 1,
      text: 'Test question',
      type: 'THEORY',
      difficulty: 'BEGINNER',
    };

    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('question', question);
      fixture.componentRef.setInput('questionNumber', 1);
      fixture.componentRef.setInput('totalQuestions', 10);
    });
    fixture.detectChanges();

    const content = fixture.nativeElement.textContent;
    expect(content).toContain('Question 1 of 10');
  });

  it('should display question text', () => {
    const question: InterviewQuestion = {
      id: 'q1',
      questionNumber: 1,
      text: 'What is Angular?',
      type: 'THEORY',
      difficulty: 'BEGINNER',
    };

    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('question', question);
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('What is Angular?');
  });

  it('should display question metadata', () => {
    const question: InterviewQuestion = {
      id: 'q1',
      questionNumber: 1,
      text: 'Test question',
      type: 'CODING',
      difficulty: 'INTERMEDIATE',
      technology: 'TypeScript',
      category: 'Functions',
    };

    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('question', question);
    });
    fixture.detectChanges();

    const content = fixture.nativeElement.textContent;
    expect(content).toContain('INTERMEDIATE');
    expect(content).toContain('TypeScript');
    expect(content).toContain('Functions');
  });

  it('should display examples if provided', () => {
    const question: InterviewQuestion = {
      id: 'q1',
      questionNumber: 1,
      text: 'Test question',
      type: 'THEORY',
      difficulty: 'BEGINNER',
      examples: ['Example 1', 'Example 2'],
    };

    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('question', question);
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Example 1');
    expect(fixture.nativeElement.textContent).toContain('Example 2');
  });

  it('should handle null question', () => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('question', null);
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('mat-card')).toBeNull();
  });

  it('should display time limit if provided', () => {
    const question: InterviewQuestion = {
      id: 'q1',
      questionNumber: 1,
      text: 'Test question',
      type: 'CODING',
      difficulty: 'INTERMEDIATE',
      timeLimit: 30,
    };

    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('question', question);
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('30 min');
  });
});
