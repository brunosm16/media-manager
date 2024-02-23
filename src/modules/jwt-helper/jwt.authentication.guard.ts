import { AuthGuard } from '@nestjs/passport';

export class JwtAuthenticationGuard extends AuthGuard('jwt') {}
