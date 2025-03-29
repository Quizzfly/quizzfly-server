import { ROLE } from '@core/constants/entity.enum';
import { ErrorCode } from '@core/constants/error-code/error-code.constant';
import { ROLES_KEY } from '@core/decorators/role.decorator';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<ROLE[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const isValid = requiredRoles.some((role) => user.role === role);
    if (!isValid) {
      throw new UnauthorizedException(ErrorCode.ACCESS_DENIED);
    }

    return isValid;
  }
}
