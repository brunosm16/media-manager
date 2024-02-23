import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfigFactory } from 'src/configuration/jwt.config';

import { JwtHelperService } from './jwt-helper.service';

@Module({
  exports: [JwtHelperService],
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: jwtConfigFactory,
    }),
  ],
  providers: [JwtHelperService],
})
export class JwtHelperModule {}
