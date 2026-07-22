import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../app/prisma.service';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { RegisterDto } from '../dto/register.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    try {
      const existing = await this.prisma.user.findUnique({
        where: { email: dto.email.toLowerCase() },
      });

      if (existing) {
        throw new ConflictException('Email already exists');
      }

      const passwordHash = await bcrypt.hash(dto.password, 10);
      const user = await this.prisma.user.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email.toLowerCase(),
          passwordHash,
          role: 'USER',
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const accessToken = await this.signAccessToken(user.id, user.email, user.role);
      const { rawToken: refreshToken } = await this.createRefreshToken(user.id);

      return { user, accessToken, refreshToken };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }

      // Handle database connection errors
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        
        // Database connection error
        if (errorMsg.includes('connect') || errorMsg.includes('prisma') || errorMsg.includes('econnrefused')) {
          this.logger.error('Database connection error during registration', error);
          throw new InternalServerErrorException('Database service unavailable. Please try again later.');
        }
        
        // Unique constraint violation
        if (errorMsg.includes('unique') || errorMsg.includes('p2002')) {
          throw new ConflictException('Email already registered');
        }
        
        // Foreign key constraint violation
        if (errorMsg.includes('foreign key') || errorMsg.includes('p2003')) {
          this.logger.error('Foreign key constraint error during registration', error);
          throw new InternalServerErrorException('Invalid user data. Please try again.');
        }
      }

      this.logger.error('Unexpected error during registration:', error);
      throw new InternalServerErrorException('Registration failed. Please try again later.');
    }
  }

  async login(dto: LoginDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email.toLowerCase() },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const validPassword = await bcrypt.compare(dto.password, user.passwordHash);
      if (!validPassword) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const safeUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      const accessToken = await this.signAccessToken(user.id, user.email, user.role);
      const { rawToken: refreshToken } = await this.createRefreshToken(user.id);

      return { user: safeUser, accessToken, refreshToken };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        if (errorMsg.includes('connect') || errorMsg.includes('prisma') || errorMsg.includes('econnrefused')) {
          this.logger.error('Database connection error during login', error);
          throw new InternalServerErrorException('Database service unavailable. Please try again later.');
        }
      }

      this.logger.error('Unexpected error during login:', error);
      throw new InternalServerErrorException('Login failed. Please try again later.');
    }
  }

  async refresh(dto: RefreshTokenDto) {
    try {
      let payload: { sub: string; type?: string };
      try {
        payload = await this.jwtService.verifyAsync(dto.refreshToken, {
          secret: process.env['JWT_SECRET'] || 'development-secret',
        });
      } catch {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token type');
      }

      const tokenHash = await this.hashToken(dto.refreshToken);
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { tokenHash },
        include: { user: { select: { id: true, email: true, role: true, isActive: true } } },
      });

      if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
        throw new UnauthorizedException('Refresh token expired or revoked');
      }

      if (!storedToken.user.isActive) {
        throw new UnauthorizedException('User account is inactive');
      }

      // Rotate: revoke old token and issue a new one
      await this.prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revoked: true },
      });

      const accessToken = await this.signAccessToken(
        storedToken.user.id,
        storedToken.user.email,
        storedToken.user.role,
      );
      const { rawToken: refreshToken } = await this.createRefreshToken(storedToken.user.id);

      return { accessToken, refreshToken };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        if (errorMsg.includes('connect') || errorMsg.includes('prisma') || errorMsg.includes('econnrefused')) {
          this.logger.error('Database connection error during token refresh', error);
          throw new InternalServerErrorException('Database service unavailable. Please try again later.');
        }
      }

      this.logger.error('Unexpected error during token refresh:', error);
      throw new InternalServerErrorException('Token refresh failed. Please try again later.');
    }
  }

  async logout(userId: string) {
    try {
      // Revoke all active refresh tokens for the user
      await this.prisma.refreshToken.updateMany({
        where: { userId, revoked: false },
        data: { revoked: true },
      });
      return { message: 'Logged out successfully' };
    } catch (error) {
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        if (errorMsg.includes('connect') || errorMsg.includes('prisma') || errorMsg.includes('econnrefused')) {
          this.logger.error('Database connection error during logout', error);
          throw new InternalServerErrorException('Database service unavailable. Please try again later.');
        }
      }

      this.logger.error('Unexpected error during logout:', error);
      throw new InternalServerErrorException('Logout failed. Please try again later.');
    }
  }

  private async createRefreshToken(userId: string): Promise<{ rawToken: string }> {
    try {
      const rawToken = await this.jwtService.signAsync(
        { sub: userId, type: 'refresh' },
        { expiresIn: '7d' },
      );
      const tokenHash = await this.hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await this.prisma.refreshToken.create({
        data: { userId, tokenHash, expiresAt },
      });

      return { rawToken };
    } catch (error) {
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        if (errorMsg.includes('connect') || errorMsg.includes('prisma') || errorMsg.includes('econnrefused')) {
          this.logger.error('Database connection error creating refresh token', error);
          throw new InternalServerErrorException('Failed to create session. Please try again.');
        }
      }
      this.logger.error('Error creating refresh token:', error);
      throw new InternalServerErrorException('Failed to create session. Please try again.');
    }
  }

  private async hashToken(token: string): Promise<string> {
    try {
      return await bcrypt.hash(token, 8);
    } catch (error) {
      this.logger.error('Error hashing token:', error);
      throw new InternalServerErrorException('Failed to secure token. Please try again.');
    }
  }

  private async signAccessToken(userId: string, email: string, role: string) {
    try {
      return await this.jwtService.signAsync(
        { sub: userId, email, role },
        { expiresIn: '15m' },
      );
    } catch (error) {
      this.logger.error('Error signing access token:', error);
      throw new InternalServerErrorException('Failed to create access token. Please try again.');
    }
  }
}
