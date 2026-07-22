import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should login', () => {
    service.login({ email: 'jane@example.com', password: 'Password1' }).subscribe();
    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush({ accessToken: 'a', refreshToken: 'r', user: { id: '1', firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com', role: 'USER', isActive: true, emailVerified: false, createdAt: 'x', updatedAt: 'x' } });
  });
});
