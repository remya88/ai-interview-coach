import { ValidationPipe as NestValidationPipe } from '@nestjs/common';

export const appValidationPipe = new NestValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
});
