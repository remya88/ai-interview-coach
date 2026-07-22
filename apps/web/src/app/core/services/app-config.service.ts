import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AppConfigService {
  readonly apiBaseUrl = 'http://localhost:3000/api';
}
