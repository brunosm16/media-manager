import type { ConfigService } from '@nestjs/config';
import type { JwtModuleOptions } from '@nestjs/jwt';

export const jwtConfigFactory = (
  configService: ConfigService
): JwtModuleOptions => ({
  secret: configService.get('JWT_SECRET'),
  signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') },
});
