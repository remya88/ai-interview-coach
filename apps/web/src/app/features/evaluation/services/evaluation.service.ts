import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import {
  EvaluationFeedback,
  InterviewEvaluation,
  EvaluationHistory,
} from '../models/evaluation.model';

@Injectable({
  providedIn: 'root',
})
export class EvaluationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/evaluation';

  private normalizeEvaluation(interviewId: string, raw: any): InterviewEvaluation {
    const scores = raw?.scores ?? {};
    const normalizedScores = {
      technicalKnowledge: Number(scores.technicalKnowledge ?? scores.technical ?? 0),
      architecture: Number(scores.architecture ?? 0),
      communication: Number(scores.communication ?? 0),
      problemSolving: Number(scores.problemSolving ?? 0),
      codeQuality: Number(scores.codeQuality ?? 0),
    };

    const evaluationCount = Number(raw?.evaluationCount ?? raw?.aiResponseJson?.evaluationCount ?? 0);

    return {
      evaluationId: raw?.evaluationId,
      interviewId,
      status: raw?.status ?? 'PROCESSING',
      overallScore: Number(raw?.overallScore ?? 0),
      scores: normalizedScores,
      averageScores: normalizedScores,
      questionsEvaluated: Number(raw?.questionsEvaluated ?? evaluationCount),
      questionsFailed: Number(raw?.questionsFailed ?? 0),
      totalQuestions: Number(raw?.totalQuestions ?? evaluationCount),
      startedAt: raw?.startedAt ? new Date(raw.startedAt) : new Date(),
      completedAt: raw?.completedAt ? new Date(raw.completedAt) : undefined,
      questions: Array.isArray(raw?.questions) ? raw.questions : [],
      strengths: Array.isArray(raw?.strengths) ? raw.strengths : [],
      weaknesses: Array.isArray(raw?.weaknesses) ? raw.weaknesses : [],
      learningRecommendations: Array.isArray(raw?.learningRecommendations)
        ? raw.learningRecommendations
        : [],
      errorMessage: raw?.errorMessage,
    };
  }

  /**
   * Start evaluation of an interview
   */
  startEvaluation(interviewId: string): Observable<{
    evaluationId: string;
    status: string;
  }> {
    return this.http.post<{
      evaluationId: string;
      status: string;
    }>(`${this.apiUrl}/interview/${interviewId}`, {});
  }

  /**
   * Get evaluation result for an interview
   */
  getEvaluation(interviewId: string): Observable<InterviewEvaluation> {
    return this.http.get<any>(
      `${this.apiUrl}/interview/${interviewId}`,
    ).pipe(map(raw => this.normalizeEvaluation(interviewId, raw)));
  }

  /**
   * Get evaluation for a specific question
   */
  getQuestionEvaluation(questionId: string): Observable<EvaluationFeedback> {
    return this.http.get<EvaluationFeedback>(
      `${this.apiUrl}/question/${questionId}`,
    );
  }

  /**
   * Get evaluation history with pagination
   */
  getEvaluationHistory(
    page = 1,
    limit = 10,
    technology?: string,
    fromDate?: Date,
    toDate?: Date,
  ): Observable<{
    data: EvaluationHistory[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (technology) {
      params = params.set('technology', technology);
    }

    if (fromDate) {
      params = params.set('fromDate', fromDate.toISOString());
    }

    if (toDate) {
      params = params.set('toDate', toDate.toISOString());
    }

    return this.http.get<{
      data: EvaluationHistory[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(`${this.apiUrl}/history`, { params });
  }

  buildReportContent(interviewId: string, evaluation: InterviewEvaluation): string {
    const lines: string[] = [];
    lines.push('AI Interview Evaluation Report');
    lines.push('==============================');
    lines.push(`Interview ID: ${interviewId}`);
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    lines.push('');
    lines.push(`Status: ${evaluation.status}`);
    lines.push(`Overall Score: ${evaluation.overallScore}/100`);
    lines.push(`Questions Evaluated: ${evaluation.questionsEvaluated}/${evaluation.totalQuestions}`);
    lines.push('');
    lines.push('Category Scores:');
    lines.push(`- Technical Knowledge: ${evaluation.averageScores.technicalKnowledge}`);
    lines.push(`- Architecture: ${evaluation.averageScores.architecture}`);
    lines.push(`- Communication: ${evaluation.averageScores.communication}`);
    lines.push(`- Problem Solving: ${evaluation.averageScores.problemSolving}`);
    lines.push(`- Code Quality: ${evaluation.averageScores.codeQuality}`);
    lines.push('');
    lines.push('Question-by-question feedback:');
    if (evaluation.questions?.length) {
      evaluation.questions.forEach((question: any, index: number) => {
        lines.push('');
        lines.push(`${index + 1}. ${question.questionText}`);
        lines.push(`   Type: ${question.questionType || 'Question'}`);
        lines.push(`   Score: ${question.evaluation?.overallScore ?? 0}/100`);
        lines.push('   Strengths:');
        if (question.evaluation?.strengths?.length) {
          question.evaluation.strengths.forEach((item: string) => lines.push(`     - ${item}`));
        } else {
          lines.push('     - No strengths recorded.');
        }
        lines.push('   Weaknesses:');
        if (question.evaluation?.weaknesses?.length) {
          question.evaluation.weaknesses.forEach((item: string) => lines.push(`     - ${item}`));
        } else {
          lines.push('     - No weaknesses recorded.');
        }
      });
    } else {
      lines.push('- No question-by-question feedback available.');
    }
    lines.push('');
    lines.push('Recommendations:');
    if (evaluation.learningRecommendations?.length) {
      evaluation.learningRecommendations.forEach(item => lines.push(`- ${item}`));
    } else {
      lines.push('- No recommendations recorded.');
    }

    return lines.join('\n');
  }

  createReportBlob(interviewId: string, evaluation: InterviewEvaluation): Blob {
    const content = this.buildReportContent(interviewId, evaluation);
    return new Blob([content], { type: 'text/plain;charset=utf-8' });
  }

  /**
   * Poll evaluation status
   */
  pollEvaluationStatus(
    interviewId: string,
    intervalMs = 2000,
    maxAttempts = 150, // 5 minutes
  ): Observable<InterviewEvaluation> {
    return new Observable(subscriber => {
      let attempts = 0;

      const poll = () => {
        this.getEvaluation(interviewId).subscribe({
          next: evaluation => {
            subscriber.next(evaluation);

            if (
              evaluation.status === 'COMPLETED' ||
              evaluation.status === 'FAILED'
            ) {
              subscriber.complete();
            } else {
              attempts++;
              if (attempts < maxAttempts) {
                setTimeout(poll, intervalMs);
              } else {
                subscriber.error(
                  new Error('Evaluation polling timeout exceeded'),
                );
              }
            }
          },
          error: err => subscriber.error(err),
        });
      };

      poll();
    });
  }
}
