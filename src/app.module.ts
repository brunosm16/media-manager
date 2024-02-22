import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  applicationConfiguration,
  typeOrmDatabaseConfiguration,
} from 'configuration';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationModule } from './authentication/authentication.module';
import { UserModule } from './user/user.module';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot(applicationConfiguration),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: typeOrmDatabaseConfiguration,
    }),
    UserModule,
    AuthenticationModule,
  ],
  providers: [AppService],
})
export class AppModule {}
