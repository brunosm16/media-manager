import { Body, Controller, Post } from '@nestjs/common';

import type {
  LoginAuthenticationResultDto,
  SignUpAuthenticationResultDto,
} from './dto';

import { AuthenticationService } from './authentication.service';
import { LoginAuthenticationDto, SignUpAuthenticationDto } from './dto';

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('/login')
  async login(
    @Body() loginAuthenticationDto: LoginAuthenticationDto
  ): Promise<LoginAuthenticationResultDto> {
    return this.authenticationService.login(loginAuthenticationDto);
  }

  @Post('/signup')
  async signUp(
    @Body() userSignUpDto: SignUpAuthenticationDto
  ): Promise<SignUpAuthenticationResultDto> {
    return this.authenticationService.signUp(userSignUpDto);
  }
}
