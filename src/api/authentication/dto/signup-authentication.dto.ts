import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class SignUpAuthenticationDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsStrongPassword()
  password: string;
}
