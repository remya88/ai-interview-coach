import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InterviewSetupComponent } from './interview-setup.component';
import { InterviewService } from '../../services/interview.service';
import { InterviewSetupStore } from '../../store/interview-setup.store';
import { Technology, InterviewCategory } from '../../models/interview.model';
import { of, throwError } from 'rxjs';

describe('InterviewSetupComponent', () => {
  let component: InterviewSetupComponent;
  let fixture: ComponentFixture<InterviewSetupComponent>;
  let mockRouter: jest.Mocked<Router>;
  let mockSnackBar: jest.Mocked<MatSnackBar>;
  let mockInterviewService: jest.Mocked<InterviewService>;
  let store: InterviewSetupStore;

  const mockTechnologies: Technology[] = [
    { id: '1', name: 'Angular', slug: 'angular', color: '#dd0031' },
    { id: '2', name: 'React', slug: 'react', color: '#61dafb' },
  ];

  const mockCategories: InterviewCategory[] = [
    { id: '1', name: 'Frontend', slug: 'frontend' },
    { id: '2', name: 'Backend', slug: 'backend' },
  ];

  beforeEach(async () => {
    // Suppress console.error for cleaner test output
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    jest.spyOn(console, 'error').mockImplementation(() => {});

    mockRouter = {
      navigate: jest.fn(),
    } as unknown as jest.Mocked<Router>;
    mockSnackBar = {
      open: jest.fn(),
    } as unknown as jest.Mocked<MatSnackBar>;
    mockInterviewService = {
      getTechnologies: jest.fn().mockReturnValue(of(mockTechnologies)),
      getCategories: jest.fn().mockReturnValue(of(mockCategories)),
      createInterview: jest.fn(),
    } as unknown as jest.Mocked<InterviewService>;

    await TestBed.configureTestingModule({
      imports: [InterviewSetupComponent, HttpClientTestingModule, BrowserAnimationsModule],
      providers: [
        InterviewSetupStore,
        { provide: Router, useValue: mockRouter },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: InterviewService, useValue: mockInterviewService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InterviewSetupComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(InterviewSetupStore);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should reset store on init', () => {
      const resetSpy = jest.spyOn(store, 'reset');
      fixture.detectChanges();
      expect(resetSpy).toHaveBeenCalled();
    });

    it('should load technologies and categories', () => {
      fixture.detectChanges();
      expect(mockInterviewService.getTechnologies).toHaveBeenCalled();
      expect(mockInterviewService.getCategories).toHaveBeenCalled();
    });
  });

  describe('technology selection', () => {
    it('should update store and selected technology', () => {
      const mockStepper = { next: jest.fn() } as any;
      component.onTechSelect(mockTechnologies[0], mockStepper);

      expect(component.selectedTechnology()).toEqual(mockTechnologies[0]);
      expect(store.technologyId()).toBe('1');
    });

    it('should advance stepper', () => {
      const mockStepper = { next: jest.fn() } as any;
      component.onTechSelect(mockTechnologies[0], mockStepper);
      expect(mockStepper.next).toHaveBeenCalled();
    });
  });

  describe('category selection', () => {
    it('should update store and selected category', () => {
      const mockStepper = { next: jest.fn() } as any;
      component.onCategorySelect(mockCategories[0], mockStepper);

      expect(component.selectedCategory()).toEqual(mockCategories[0]);
      expect(store.categoryId()).toBe('1');
    });
  });

  describe('difficulty selection', () => {
    it('should update store difficulty', () => {
      const mockStepper = { next: jest.fn() } as any;
      component.onDifficultySelect('INTERMEDIATE', mockStepper);

      expect(store.difficulty()).toBe('INTERMEDIATE');
    });
  });

  describe('interview type selection', () => {
    it('should update store interview type', () => {
      const mockStepper = { next: jest.fn() } as any;
      component.onInterviewTypeSelect('TECHNICAL', mockStepper);

      expect(store.interviewType()).toBe('TECHNICAL');
    });
  });

  describe('question count selection', () => {
    it('should update store question count', () => {
      component.onQuestionCountSelect(10);
      expect(store.questionCount()).toBe(10);
    });
  });

  describe('startInterview', () => {
    const mockInterview = {
      id: 'interview-1',
      status: 'CREATED',
      technology: mockTechnologies[0],
      category: mockCategories[0],
      difficulty: 'INTERMEDIATE',
      interviewType: 'TECHNICAL',
      questionCount: 10,
      createdAt: new Date().toISOString(),
    };

    beforeEach(() => {
      store.setTechnology('1');
      store.setCategory('1');
      store.setDifficulty('INTERMEDIATE' as any);
      store.setInterviewType('TECHNICAL' as any);
      store.setQuestionCount(10);
    });

    it('should create interview', () => {
      mockInterviewService.createInterview.mockReturnValue(of(mockInterview as any));

      component.startInterview();

      expect(mockInterviewService.createInterview).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/interview', 'interview-1']);
    });

    it('should handle creation error', () => {
      const error = { error: { message: 'Creation failed' } };
      mockInterviewService.createInterview.mockReturnValue(throwError(() => error));

      component.startInterview();

      expect(store.error()).toBe('Creation failed');
    });

    it('should not create if form invalid', () => {
      store.setTechnology(null);

      component.startInterview();

      expect(mockInterviewService.createInterview).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should set error on load failure', () => {
      const errorMsg = 'Load failed';
      store.setError(errorMsg);
      expect(store.error()).toBe(errorMsg);
    });

    it('should clear error', () => {
      store.setError('Test error');
      store.setError(null);
      expect(store.error()).toBeNull();
    });
  });

  describe('cancel', () => {
    it('should navigate to dashboard on cancel', () => {
      jest.spyOn(window, 'confirm').mockReturnValue(true);
      component.onCancel();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should not navigate if cancelled', () => {
      jest.spyOn(window, 'confirm').mockReturnValue(false);
      component.onCancel();

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });
});
