import { ICurrentUser } from '@core/interfaces/index';

export interface PermissionHandlerInterface {
  handle(user: ICurrentUser): boolean;
}
