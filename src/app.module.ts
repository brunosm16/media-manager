import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  applicationConfiguration,
  typeOrmDatabaseConfiguration,
} from 'src/configuration';

import { AuthenticationModule } from './api/authentication/authentication.module';
import { MediaModule } from './api/media/media.module';
import { UserModule } from './api/user/user.module';
import { JwtHelperModule } from './modules/jwt-helper/jwt-helper.module';

@Module({
  imports: [
    ConfigModule.forRoot(applicationConfiguration),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: typeOrmDatabaseConfiguration,
    }),
    UserModule,
    AuthenticationModule,
    MediaModule,
    JwtHelperModule,
  ],
})
export class AppModule {}
