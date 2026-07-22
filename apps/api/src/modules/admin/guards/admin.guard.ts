import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AdminGuard extends AuthGuard('jwt') implements CanActivate {
  override async canActivate(context: ExecutionContext): Promise<boolean> {
    // First run JWT validation
    const jwtResult = await super.canActivate(context);
    if (!jwtResult) throw new UnauthorizedException('Authentication required');

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) throw new UnauthorizedException('Authentication required');

    if (user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Access denied. Administrator privileges required.',
      );
    }

    return true;
  }

  override handleRequest(err: any, user: any): any {
    if (err || !user) {
      throw new UnauthorizedException('Authentication required');
    }
    return user;
  }
}
