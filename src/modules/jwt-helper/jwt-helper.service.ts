import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import type { JwtPayload } from './jwt-helper.types';

@Injectable()
export class JwtHelperService {
  constructor(private readonly jwtService: JwtService) {}

  async generateAccessToken(payload: JwtPayload) {
    return this.jwtService.sign({ ...payload });
  }
}
