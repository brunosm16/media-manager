import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { logErrorDetailed } from 'src/utils/logs';

import type {
  SignUpAuthenticationDto,
  SignUpAuthenticationResultDto,
} from './dto';

@Injectable()
export class AuthenticationService {
  constructor(private readonly userService: UserService) {}

  async signUp(
    userSignUpDto: SignUpAuthenticationDto
  ): Promise<SignUpAuthenticationResultDto> {
    try {
      const { createdAt, email, id } =
        await this.userService.create(userSignUpDto);

      return {
        createdAt,
        email,
        id,
      } as SignUpAuthenticationResultDto;
    } catch (err) {
      logErrorDetailed(err, 'Error while signing up a user');
      throw new Error(err);
    }
  }
}
