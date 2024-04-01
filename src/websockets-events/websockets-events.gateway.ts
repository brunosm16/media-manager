import type {
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import type { Socket } from 'socket.io';

import { Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { JwtHelperService } from 'src/modules/jwt-helper/jwt-helper.service';

@WebSocketGateway()
export class WebsocketsEventsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(private readonly jwtHelperService: JwtHelperService) {}

  private emitAuthorizationError(client: Socket, errorMessage: string): void {
    Logger.error(errorMessage);
    client.emit('onAuthorizationError', errorMessage);
    client.disconnect();
  }

  private extractAccessToken(client: Socket): null | string {
    const authorization = client?.handshake?.headers?.authorization;
    return authorization?.split(' ')[1];
  }

  async handleConnection(client: Socket, ...args: any[]): Promise<void> {
    Logger.log(`WebSocket connected with id: ${client.id}`);

    const accessToken = this.extractAccessToken(client);

    if (!accessToken) {
      this.emitAuthorizationError(client, 'Access Token not provided');
      return;
    }

    const userId =
      await this.jwtHelperService.getUserIdFromAccessToken(accessToken);

    if (!userId) {
      this.emitAuthorizationError(client, 'User not found');
      return;
    }

    client.join(userId);

    Logger.log(`Websocket client connected with user id:${userId}`);
  }

  handleDisconnect(client: any): void {
    const namespaceName = client.nsp.name;
    const clientSocketId = client.id;

    Logger.log(
      `Client disconnected from namespace:${namespaceName} and with client id:${clientSocketId}`
    );

    client.leave(namespaceName);
  }
}
