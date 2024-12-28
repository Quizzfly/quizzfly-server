import { PermissionHandlerInterface } from '@core/interfaces/permission-handler.interface';
import { SetMetadata } from '@nestjs/common';

export const CHECK_PERMISSION_KEY = 'checkPermission';
export const CheckPermissions = (...handlers: PermissionHandlerInterface[]) =>
  SetMetadata(CHECK_PERMISSION_KEY, handlers);
