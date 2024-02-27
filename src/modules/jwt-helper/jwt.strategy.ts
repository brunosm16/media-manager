import type { UserEntity } from 'src/api/user/entities/user.entity';

import { ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/api/user/user.service';

import type { JwtPayload } from './jwt-helper.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(UserService) private readonly userService: UserService,
    @Inject(ConfigService) private readonly configService: ConfigService
  ) {
    super({
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<UserEntity> {
    const { email } = payload;
    const user = await this.userService.findUserByEmail(email);

    Logger.log(`User with email ${email} authenticated`);

    if (!user) {
      Logger.error(`Invalid access token for user with email ${email} `);

      throw new ForbiddenException('Invalid access token');
    }

    Logger.log(`User with email ${email} authenticated`);

    return user;
  }
}
