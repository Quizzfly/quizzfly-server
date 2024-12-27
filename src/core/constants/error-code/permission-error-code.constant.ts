import { ErrorCode } from '@core/constants/error-code/error-code.constant';

export const PermissionErrorCode: Record<string, string> = {
  [ErrorCode.PERMISSION_INVALID]: 'permission.error.permission_invalid',
  [ErrorCode.PERMISSION_ALREADY_EXISTS_IN_ROLE]:
    'permission.error.permission_already_exists_in_role',
};
