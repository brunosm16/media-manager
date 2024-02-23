import type { UserEntity } from 'src/user/entities/user.entity';

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtHelperService } from 'src/modules/jwt-helper/jwt-helper.service';
import { UserService } from 'src/user/user.service';
import { logErrorDetailed } from 'src/utils/logs';

import type {
  LoginAuthenticationDto,
  LoginAuthenticationResultDto,
  SignUpAuthenticationDto,
  SignUpAuthenticationResultDto,
} from './dto';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtHelperService: JwtHelperService
  ) {}

  async login(
    loginAuthenticationDto: LoginAuthenticationDto
  ): Promise<LoginAuthenticationResultDto> {
    try {
      const user = await this.userService.findUserByEmailWithSelectedFields(
        loginAuthenticationDto.email
      );

      await this.runLoginValidations(loginAuthenticationDto, user);

      const loginInfo = {
        email: user.email,
        id: user.id,
      };

      return {
        accessToken: await this.jwtHelperService.generateAccessToken(loginInfo),
        ...loginInfo,
      } as LoginAuthenticationResultDto;
    } catch (err) {
      logErrorDetailed(err, 'Error while doing user login');
      throw err;
    }
  }

  async runLoginValidations(
    loginAuthenticationDto: LoginAuthenticationDto,
    user: UserEntity
  ): Promise<void> {
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isCorrectPassword = await this.userService.validatePassword(
      loginAuthenticationDto.password,
      user
    );

    if (!isCorrectPassword) {
      throw new ForbiddenException('Invalid password');
    }
  }

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
