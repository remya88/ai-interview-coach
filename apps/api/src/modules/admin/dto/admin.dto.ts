import {
  IsString,
  IsOptional,
  IsIn,
  IsBoolean,
  IsNumber,
  Min,
  Max,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AdminUserListQueryDto {
  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) page?: number;
  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) limit?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() search?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsIn(['USER', 'ADMIN']) role?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() @Type(() => Boolean) isActive?: boolean;
}

export class UpdateUserStatusDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  declare isActive: boolean;
}

export class UpdateUserRoleDto {
  @ApiProperty({ example: 'ADMIN', enum: ['USER', 'ADMIN'] })
  @IsIn(['USER', 'ADMIN'])
  declare role: string;
}

export class AdminInterviewQueryDto {
  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) page?: number;
  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) limit?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() technology?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() status?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() fromDate?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() toDate?: string;
}

export class CreateTechnologyDto {
  @ApiProperty() @IsString() declare name: string;
  @ApiProperty() @IsString() declare slug: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() icon?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() color?: string;
}

export class UpdateTechnologyDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() name?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() @Type(() => Boolean) isActive?: boolean;
}

export class CreateCategoryDto {
  @ApiProperty() @IsString() declare name: string;
  @ApiProperty() @IsString() declare slug: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
}

export class UpdateCategoryDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() name?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() @Type(() => Boolean) isActive?: boolean;
}

export class UpdateAIConfigDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() modelName?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Min(0) @Max(2) temperature?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @IsPositive() maxTokens?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() systemPromptVersion?: string;
}

export class CreateAIConfigDto {
  @ApiProperty() @IsString() declare modelName: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Min(0) @Max(2) temperature?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @IsPositive() maxTokens?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
}
