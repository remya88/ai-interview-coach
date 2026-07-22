import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../app/prisma.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        profileImage: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: dto.firstName ?? user.firstName,
        lastName: dto.lastName ?? user.lastName,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        profileImage: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const hasProfileData =
      dto.jobTitle !== undefined ||
      dto.experienceYears !== undefined ||
      dto.preferredRole !== undefined ||
      dto.preferredInterviewType !== undefined ||
      dto.bio !== undefined ||
      dto.linkedinUrl !== undefined ||
      dto.githubUrl !== undefined ||
      dto.portfolioUrl !== undefined ||
      dto.timezone !== undefined ||
      dto.language !== undefined;

    if (hasProfileData) {
      await this.prisma.userProfile.upsert({
        where: { userId },
        update: {
          jobTitle: dto.jobTitle,
          experienceYears: dto.experienceYears,
          preferredRole: dto.preferredRole,
          preferredInterviewType: dto.preferredInterviewType,
          bio: dto.bio,
          linkedinUrl: dto.linkedinUrl,
          githubUrl: dto.githubUrl,
          portfolioUrl: dto.portfolioUrl,
          timezone: dto.timezone,
          language: dto.language,
        },
        create: {
          userId,
          jobTitle: dto.jobTitle,
          experienceYears: dto.experienceYears,
          preferredRole: dto.preferredRole,
          preferredInterviewType: dto.preferredInterviewType,
          bio: dto.bio,
          linkedinUrl: dto.linkedinUrl,
          githubUrl: dto.githubUrl,
          portfolioUrl: dto.portfolioUrl,
          timezone: dto.timezone,
          language: dto.language,
        },
      });
    }

    return updatedUser;
  }
}
