import { Module } from '@nestjs/common';
import { JwtHelperModule } from 'src/modules/jwt-helper/jwt-helper.module';

import { WebsocketsEventsGateway } from './websockets-events.gateway';

@Module({
  imports: [JwtHelperModule],
  providers: [WebsocketsEventsGateway],
})
export class WebsocketsEventsModule {}
