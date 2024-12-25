import { IS_PUBLIC } from '@core/constants/app.constant';
import { ROLE } from '@core/constants/entity.enum';
import { ErrorCode } from '@core/constants/error-code/error-code.constant';
import { CHECK_PERMISSION_KEY } from '@core/decorators/permission.decorator';
import { ICurrentUser } from '@core/interfaces';
import { PermissionHandlerInterface } from '@core/interfaces/permission-handler.interface';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  /**
   * check if user authorized
   * @param context
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.get<boolean>(
      IS_PUBLIC,
      context.getHandler(),
    );
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const user: ICurrentUser = request.user;

    if (user.role === ROLE.ADMIN) return true;

    const permissionHandlers =
      this.reflector.get<PermissionHandlerInterface[]>(
        CHECK_PERMISSION_KEY,
        context.getHandler(),
      ) ?? [];

    const permitted = permissionHandlers.every((handler) =>
      handler.handle(user),
    );

    if (!permitted) {
      throw new ForbiddenException(ErrorCode.ACCESS_DENIED);
    }
    return permitted;
  }
}
