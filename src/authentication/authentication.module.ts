import { Module } from '@nestjs/common';
import { JwtHelperModule } from 'src/modules/jwt-helper/jwt-helper.module';
import { UserModule } from 'src/user/user.module';

import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';

@Module({
  controllers: [AuthenticationController],
  imports: [UserModule, JwtHelperModule],
  providers: [AuthenticationService],
})
export class AuthenticationModule {}
