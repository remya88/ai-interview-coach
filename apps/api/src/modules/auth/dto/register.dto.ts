import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  firstName!: string;

  @IsString()
  @MinLength(2)
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @Matches(/((?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,})/, {
    message: 'Password must contain uppercase, lowercase and number',
  })
  password!: string;
}
