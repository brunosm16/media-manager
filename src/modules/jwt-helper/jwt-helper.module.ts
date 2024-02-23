import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfigFactory } from 'src/configuration/jwt.config';

import { UserModule } from '../../api/user/user.module';
import { JwtStrategy } from './jwt.strategy';
import { JwtHelperService } from './jwt-helper.service';

@Module({
  exports: [JwtHelperService],
  imports: [
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: jwtConfigFactory,
    }),
  ],
  providers: [JwtHelperService, JwtStrategy],
})
export class JwtHelperModule {}
