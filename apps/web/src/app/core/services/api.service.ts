import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../config/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private readonly http: HttpClient) {}

  getHello(): Observable<{ message: string }> {
    return this.http.get<{ message: string }>(`${environment.apiBaseUrl}`);
  }
}
