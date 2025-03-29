import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Socket } from 'socket.io';

@Injectable()
export class WsResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const client = context.switchToWs().getClient<Socket>();
    const eventName = context.getHandler().name;

    return next.handle().pipe(
      map((data) => {
        console.log(`Emitting event: ${eventName}`, data);

        return {
          ...data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
