import { ROLE } from '@core/constants/entity.enum';
import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: ROLE[]): CustomDecorator =>
  SetMetadata(ROLES_KEY, roles);
