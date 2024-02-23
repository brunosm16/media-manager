import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface JwtPayload {
  email: string;
  id: string;
}

@Injectable()
export class JwtHelperService {
  constructor(private readonly jwtService: JwtService) {}

  async generateAccessToken(payload: JwtPayload) {
    return this.jwtService.sign({ ...payload });
  }
}
