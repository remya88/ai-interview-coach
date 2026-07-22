import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { AdminGuard } from './admin.guard';

const createMockContext = (user: object | null) => ({
  switchToHttp: () => ({ getRequest: () => ({ user }) }),
  getHandler: () => ({}),
  getClass: () => ({}),
  getType: () => 'http',
  getArgByIndex: () => null,
  getArgs: () => [],
}) as unknown as ExecutionContext;

describe('AdminGuard', () => {
  let guard: AdminGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminGuard],
    }).compile();
    guard = module.get<AdminGuard>(AdminGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('handleRequest should throw UnauthorizedException when no user', () => {
    expect(() => guard.handleRequest(null, null)).toThrow(UnauthorizedException);
  });

  it('handleRequest should return user when user exists', () => {
    const user = { id: 'u-1', role: 'ADMIN' };
    expect(guard.handleRequest(null, user)).toBe(user);
  });

  it('handleRequest should throw UnauthorizedException when error passed', () => {
    expect(() => guard.handleRequest(new Error('jwt error'), null)).toThrow(UnauthorizedException);
  });
});
