import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AdminService } from './admin.service';
import { AdminDashboard, AIUsageStats } from '../models/admin.model';

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminService],
    });
    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getDashboard should GET /api/admin/dashboard', (done) => {
    service.getDashboard().subscribe(() => {
      done();
    });
    const req = httpMock.expectOne('/api/admin/dashboard');
    expect(req.request.method).toBe('GET');
    req.flush({ totalUsers: 100, activeUsers: 80 } as AdminDashboard);
  });

  it('getUsers should GET /api/admin/users with query params', (done) => {
    service.getUsers({ page: 2, limit: 10, search: 'john', role: 'ADMIN' }).subscribe(() => {
      done();
    });
    const req = httpMock.expectOne(r => r.url === '/api/admin/users' && r.params.has('page'));
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('search')).toBe('john');
    req.flush({ data: [], pagination: { page: 2, limit: 10, total: 0, pages: 0 } });
  });

  it('getUserDetail should GET /api/admin/users/:id', (done) => {
    service.getUserDetail('u-1').subscribe(() => {
      done();
    });
    const req = httpMock.expectOne('/api/admin/users/u-1');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('updateUserStatus should PATCH /api/admin/users/:id/status', (done) => {
    service.updateUserStatus('u-1', false).subscribe(() => {
      done();
    });
    const req = httpMock.expectOne('/api/admin/users/u-1/status');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ isActive: false });
    req.flush({});
  });

  it('updateUserRole should PATCH /api/admin/users/:id/role', (done) => {
    service.updateUserRole('u-1', 'ADMIN').subscribe(() => {
      done();
    });
    const req = httpMock.expectOne('/api/admin/users/u-1/role');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ role: 'ADMIN' });
    req.flush({});
  });

  it('getAIUsage should GET /api/admin/ai-usage with days param', (done) => {
    service.getAIUsage(7).subscribe(() => {
      done();
    });
    const req = httpMock.expectOne(r => r.url === '/api/admin/ai-usage' && r.params.has('days'));
    expect(req.request.params.get('days')).toBe('7');
    req.flush({ totalRequests: 100, totalTokens: 5000 } as AIUsageStats);
  });

  it('getAIConfigs should GET /api/admin/ai-config', (done) => {
    service.getAIConfigs().subscribe(() => {
      done();
    });
    const req = httpMock.expectOne('/api/admin/ai-config');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('createAIConfig should POST /api/admin/ai-config', (done) => {
    service.createAIConfig({ modelName: 'gpt-4o' }).subscribe(() => {
      done();
    });
    const req = httpMock.expectOne('/api/admin/ai-config');
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('activateAIConfig should PATCH /api/admin/ai-config/:id/activate', (done) => {
    service.activateAIConfig('c-1').subscribe(() => {
      done();
    });
    const req = httpMock.expectOne('/api/admin/ai-config/c-1/activate');
    expect(req.request.method).toBe('PATCH');
    req.flush({});
  });

  it('getTechnologies should GET /api/admin/technologies', (done) => {
    service.getTechnologies().subscribe(() => {
      done();
    });
    const req = httpMock.expectOne('/api/admin/technologies');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getErrors should GET /api/admin/errors with filters', (done) => {
    service.getErrors('CRITICAL', 3).subscribe(() => {
      done();
    });
    const req = httpMock.expectOne(r => r.url === '/api/admin/errors' && r.params.has('days'));
    expect(req.request.params.get('severity')).toBe('CRITICAL');
    expect(req.request.params.get('days')).toBe('3');
    req.flush([]);
  });
});
