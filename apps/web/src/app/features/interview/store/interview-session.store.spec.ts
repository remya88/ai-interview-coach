import { TestBed } from '@angular/core/testing';
import { InterviewSessionStore } from './interview-session.store';
import { InterviewQuestion, InterviewAnswer } from '../models/interview-session.model';

describe('InterviewSessionStore', () => {
  let store: InterviewSessionStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InterviewSessionStore],
    });
    store = TestBed.inject(InterviewSessionStore);
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      expect(store.interviewId()).toBeNull();
      expect(store.currentQuestion()).toBeNull();
      expect(store.questionNumber()).toBe(0);
      expect(store.totalQuestions()).toBe(0);
      expect(store.currentAnswer()).toBe('');
      expect(store.submitted()).toBe(false);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
      expect(store.status()).toBe('INIT');
    });
  });

  describe('setters', () => {
    it('should set interview ID', () => {
      store.setInterviewId('123');
      expect(store.interviewId()).toBe('123');
    });

    it('should set session ID', () => {
      store.setSessionId('session-456');
      expect(store.sessionId()).toBe('session-456');
    });

    it('should set current question', () => {
      const question: InterviewQuestion = {
        id: 'q1',
        questionNumber: 1,
        text: 'What is TypeScript?',
        type: 'THEORY',
        difficulty: 'BEGINNER',
      };
      store.setCurrentQuestion(question, 1, 10);
      expect(store.currentQuestion()).toEqual(question);
      expect(store.questionNumber()).toBe(1);
      expect(store.totalQuestions()).toBe(10);
    });

    it('should update current answer', () => {
      store.updateCurrentAnswer('My answer');
      expect(store.currentAnswer()).toBe('My answer');
    });

    it('should set submitted state', () => {
      store.setSubmitted(true);
      expect(store.submitted()).toBe(true);
    });

    it('should set loading state', () => {
      store.setLoading(true);
      expect(store.loading()).toBe(true);
    });

    it('should set error', () => {
      store.setError('Network error');
      expect(store.error()).toBe('Network error');
    });

    it('should set status', () => {
      store.setStatus('IN_PROGRESS');
      expect(store.status()).toBe('IN_PROGRESS');
    });
  });

  describe('computed selectors', () => {
    it('should compute progress percentage', () => {
      store.setCurrentQuestion(
        {
          id: 'q1',
          questionNumber: 1,
          text: 'Q1',
          type: 'THEORY',
          difficulty: 'BEGINNER',
        },
        1,
        10,
      );
      store.recordAnswer('q1', { questionId: 'q1', answerText: 'Answer' });
      expect(store.progress()).toBe(10); // 1/10 = 10%
    });

    it('should track answered questions count', () => {
      store.recordAnswer('q1', { questionId: 'q1', answerText: 'A1' });
      store.recordAnswer('q2', { questionId: 'q2', answerText: 'A2' });
      expect(store.answeredCount()).toBe(2);
    });

    it('should check if can go to next question', () => {
      store.setCurrentQuestion(
        {
          id: 'q1',
          questionNumber: 1,
          text: 'Q1',
          type: 'THEORY',
          difficulty: 'BEGINNER',
        },
        1,
        3,
      );
      expect(store.canGoNext()).toBe(true);

      store.setCurrentQuestion(
        {
          id: 'q3',
          questionNumber: 3,
          text: 'Q3',
          type: 'THEORY',
          difficulty: 'BEGINNER',
        },
        3,
        3,
      );
      expect(store.canGoNext()).toBe(false);
    });

    it('should check if can go to previous question', () => {
      store.setCurrentQuestion(
        {
          id: 'q1',
          questionNumber: 1,
          text: 'Q1',
          type: 'THEORY',
          difficulty: 'BEGINNER',
        },
        1,
        3,
      );
      expect(store.canGoPrevious()).toBe(false);

      store.setCurrentQuestion(
        {
          id: 'q2',
          questionNumber: 2,
          text: 'Q2',
          type: 'THEORY',
          difficulty: 'BEGINNER',
        },
        2,
        3,
      );
      expect(store.canGoPrevious()).toBe(true);
    });

    it('should validate answer', () => {
      store.updateCurrentAnswer('');
      expect(store.isAnswerValid()).toBe(false);

      store.updateCurrentAnswer('  ');
      expect(store.isAnswerValid()).toBe(false);

      store.updateCurrentAnswer('Valid answer');
      expect(store.isAnswerValid()).toBe(true);
    });

    it('should compute answer statistics', () => {
      store.updateCurrentAnswer('Hello world\nSecond line');
      const stats = store.answerStats();
      expect(stats.characters).toBe(23);
      expect(stats.words).toBe(4);
      expect(stats.lines).toBe(2);
    });
  });

  describe('answer recording', () => {
    it('should record answer', () => {
      const answer: InterviewAnswer = {
        questionId: 'q1',
        answerText: 'My answer',
        timeTakenSeconds: 30,
      };
      store.recordAnswer('q1', answer);
      expect(store.getAnswerForQuestion('q1')).toEqual(answer);
    });

    it('should return all answers', () => {
      const answer1: InterviewAnswer = { questionId: 'q1', answerText: 'A1' };
      const answer2: InterviewAnswer = { questionId: 'q2', answerText: 'A2' };
      store.recordAnswer('q1', answer1);
      store.recordAnswer('q2', answer2);

      const all = store.getAllAnswers();
      expect(all.length).toBe(2);
      expect(all).toContain(answer1);
      expect(all).toContain(answer2);
    });
  });

  describe('navigation', () => {
    it('should move to question and save current answer', () => {
      const question: InterviewQuestion = {
        id: 'q1',
        questionNumber: 1,
        text: 'Q1',
        type: 'THEORY',
        difficulty: 'BEGINNER',
      };
      store.setCurrentQuestion(question, 1, 10);
      store.updateCurrentAnswer('My answer');

      store.moveToQuestion(2);

      expect(store.questionNumber()).toBe(2);
      expect(store.currentAnswer()).toBe('');
      expect(store.getAnswerForQuestion('q1')?.answerText).toBe('My answer');
    });

    it('should not save empty answer when moving', () => {
      const question: InterviewQuestion = {
        id: 'q1',
        questionNumber: 1,
        text: 'Q1',
        type: 'THEORY',
        difficulty: 'BEGINNER',
      };
      store.setCurrentQuestion(question, 1, 10);
      store.updateCurrentAnswer('');

      store.moveToQuestion(2);

      expect(store.getAnswerForQuestion('q1')).toBeUndefined();
    });
  });

  describe('reset', () => {
    it('should reset session state', () => {
      store.setInterviewId('123');
      store.setSessionId('session-456');
      store.setLoading(true);
      store.setError('Some error');

      store.resetSession();

      expect(store.interviewId()).toBeNull();
      expect(store.sessionId()).toBeNull();
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
      expect(store.status()).toBe('INIT');
    });
  });

  describe('timer state', () => {
    it('should update timer state', () => {
      store.updateTimerState({
        totalSeconds: 300,
        remainingSeconds: 250,
        isRunning: true,
      });

      const timer = store.timerState();
      expect(timer.totalSeconds).toBe(300);
      expect(timer.remainingSeconds).toBe(250);
      expect(timer.isRunning).toBe(true);
    });

    it('should partially update timer state', () => {
      store.updateTimerState({ totalSeconds: 300, remainingSeconds: 250 });
      store.updateTimerState({ isRunning: true });

      const timer = store.timerState();
      expect(timer.totalSeconds).toBe(300);
      expect(timer.remainingSeconds).toBe(250);
      expect(timer.isRunning).toBe(true);
    });
  });
});
