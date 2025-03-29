import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class CamelToSnakeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => this.convertCamelToSnake(data)));
  }

  private convertCamelToSnake(data: any): any {
    if (Array.isArray(data)) {
      return data.map((item) => this.convertCamelToSnake(item));
    } else if (data instanceof Date) {
      return data;
    } else if (data !== null && typeof data === 'object') {
      const newObj = {};
      Object.keys(data).forEach((key) => {
        const snakeKey = this.camelToSnake(key);
        newObj[snakeKey] = this.convertCamelToSnake(data[key]);
      });
      return newObj;
    }
    return data;
  }

  private camelToSnake(key: string): string {
    return key.replace(/([A-Z])/g, '_$1').toLowerCase();
  }
}
