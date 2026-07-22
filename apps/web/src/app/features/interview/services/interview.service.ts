import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Technology, InterviewCategory, Interview, InterviewSetupConfig } from '../models/interview.model';
import { InterviewQuestion, InterviewAnswer } from '../models/interview-session.model';

export interface BackendInterviewQuestion extends Partial<InterviewQuestion> {
  id: string;
  questionNumber: number;
  questionText?: string;
  questionType?: InterviewQuestion['type'];
  expectedDuration?: number;
  timeLimit?: number;
  answer?: {
    questionId?: string;
    answerText?: string | null;
    codeAnswer?: string | null;
    timeTakenSeconds?: number | null;
  } | null;
}

export interface CurrentQuestionResponse {
  question: BackendInterviewQuestion;
  currentNumber: number;
  totalQuestions: number;
}

@Injectable({ providedIn: 'root' })
export class InterviewService {
  private readonly apiBase = '/api/interviews';

  constructor(private readonly http: HttpClient) {}

  /**
   * Fetch available technologies for interview setup
   */
  getTechnologies(): Observable<Technology[]> {
    return this.http.get<Technology[]>(`/api/technologies`);
  }

  /**
   * Fetch available interview categories
   */
  getCategories(): Observable<InterviewCategory[]> {
    return this.http.get<InterviewCategory[]>(`/api/categories`);
  }

  /**
   * Create a new interview session
   */
  createInterview(config: InterviewSetupConfig): Observable<Interview> {
    return this.http.post<Interview>(this.apiBase, config);
  }

  /**
   * Get interview details
   */
  getInterview(id: string): Observable<Interview> {
    return this.http.get<Interview>(`${this.apiBase}/${id}`);
  }

  /**
   * Get dashboard summary
   */
  getDashboard(): Observable<any> {
    return this.http.get(`${this.apiBase}/dashboard`);
  }

  /**
   * Get interview history with pagination and filters
   */
  getHistory(page = 1, limit = 10): Observable<any> {
    return this.http.get(`${this.apiBase}/history`, {
      params: { page: page.toString(), limit: limit.toString() },
    });
  }

  /**
   * Start an interview session
   */
  startInterview(id: string): Observable<any> {
    return this.http.post(`${this.apiBase}/${id}/start`, {});
  }

  /**
   * Get current question in interview session
   */
  getCurrentQuestion(interviewId: string): Observable<CurrentQuestionResponse> {
    return this.http.get<CurrentQuestionResponse>(
      `${this.apiBase}/${interviewId}/current-question`,
    );
  }

  navigateQuestion(
    interviewId: string,
    questionNumber: number,
  ): Observable<CurrentQuestionResponse> {
    return this.http.post<CurrentQuestionResponse>(
      `${this.apiBase}/${interviewId}/navigate`,
      { questionNumber },
    );
  }

  /**
   * Submit answer to a question
   */
  submitAnswer(
    interviewId: string,
    questionId: string,
    answer: Partial<InterviewAnswer>,
  ): Observable<any> {
    return this.http.post(
      `${this.apiBase}/${interviewId}/questions/${questionId}/answer`,
      answer,
    );
  }

  /**
   * Complete interview session
   */
  completeInterview(interviewId: string): Observable<any> {
    return this.http.post(`${this.apiBase}/${interviewId}/complete`, {});
  }

  /**
   * Resume paused interview
   */
  resumeInterview(interviewId: string): Observable<any> {
    return this.http.post(`${this.apiBase}/${interviewId}/resume`, {});
  }
}
