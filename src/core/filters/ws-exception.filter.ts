import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch(WsException, HttpException, Error)
export class WsExceptionFilter implements ExceptionFilter {
  catch(exception: WsException | HttpException | Error, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();
    let message: any = 'Internal Server Error';
    if (exception instanceof HttpException) {
      message = exception.message;
    } else if (exception instanceof WsException) {
      message = exception.getError();
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    client.emit('exception', {
      status: 'error',
      message,
    });
  }
}
