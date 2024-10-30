import {
  ConnectedSocket, MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit, SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/ws',
  transports: ['websocket'],
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor() {}

  @WebSocketServer() server: Server;

  private rooms: Record<string, Set<string>> = {};


  afterInit(server: Server) {
    console.log(server);
  }

  handleDisconnect(client: Socket) {
    console.log(`Disconnected: ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Connected ${client.id}`);
  }

  @SubscribeMessage('createRoom')
  handleCreateRoom(@MessageBody() roomPin: string, @ConnectedSocket() client: Socket) {
    if (!this.rooms[roomPin]) {
      this.rooms[roomPin] = new Set();
      console.log(`Room created with pin: ${roomPin}`);
    }
    this.rooms[roomPin].add(client.id);
    client.join(roomPin);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@MessageBody() roomPin: string, @ConnectedSocket() client: Socket) {
    if (this.rooms[roomPin]) {
      this.rooms[roomPin].add(client.id);
      client.join(roomPin);
      console.log(`Client ${client.id} joined room ${roomPin}`);
    } else {
      client.emit('error', 'Room not found');
    }
  }
}
