import { PermissionPayload } from '@config/permission.config';
import { ICurrentUser } from '@core/interfaces';
import { PermissionHandlerInterface } from '@core/interfaces/permission-handler.interface';

export class PermissionHandler implements PermissionHandlerInterface {
  constructor(private readonly permission: PermissionPayload) {}

  handle(user: ICurrentUser): boolean {
    const { resource, actions } = this.permission;
    if (user && user.role && user.permissions) {
      const setPermission = new Set(user.permissions);
      return actions.every((action) =>
        setPermission.has(`${resource}:${action}`),
      );
    }
    return false;
  }
}
