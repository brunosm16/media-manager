import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/api/user/user.service';

import type { JwtPayload } from './jwt-helper.types';

@Injectable()
export class JwtHelperService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService
  ) {}

  async generateAccessToken(payload: JwtPayload) {
    return this.jwtService.sign({ ...payload });
  }

  async getUserIdFromAccessToken(accessToken: string): Promise<null | string> {
    try {
      const { id: userId } = await this.jwtService.verify(accessToken);

      if (!userId) {
        throw new UnauthorizedException('Invalid token');
      }

      await this.userService.validateUserExistsById(userId);

      return userId;
    } catch (err) {
      Logger.error(`Error while validating token:${err}`);
      return null;
    }
  }
}
