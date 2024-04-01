import type { MiddlewareConsumer, NestModule } from '@nestjs/common';

import { BullModule } from '@nestjs/bull';
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
import { MediaManagerLoggerMiddleware } from './middlewares/media-manager-logger-middleware';
import { JwtHelperModule } from './modules/jwt-helper/jwt-helper.module';
import { mediaManagerBullRootFactory } from './modules/media-manager-jobs/media-manager-jobs.configuration';
import { WebsocketsEventsModule } from './websockets-events/websockets-events.module';

@Module({
  imports: [
    ConfigModule.forRoot(applicationConfiguration),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: mediaManagerBullRootFactory,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: typeOrmDatabaseConfiguration,
    }),
    UserModule,
    AuthenticationModule,
    MediaModule,
    JwtHelperModule,
    WebsocketsEventsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(MediaManagerLoggerMiddleware).forRoutes('*');
  }
}
