import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';

import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';

@Module({
  controllers: [AuthenticationController],
  imports: [UserModule],
  providers: [AuthenticationService],
})
export class AuthenticationModule {}
