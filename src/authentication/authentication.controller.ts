import { Body, Controller, Post } from '@nestjs/common';

import type { SignUpAuthenticationResultDto } from './dto';

import { AuthenticationService } from './authentication.service';
import { SignUpAuthenticationDto } from './dto';

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('/signup')
  async signUp(
    @Body() userSignUpDto: SignUpAuthenticationDto
  ): Promise<SignUpAuthenticationResultDto> {
    return this.authenticationService.signUp(userSignUpDto);
  }
}
