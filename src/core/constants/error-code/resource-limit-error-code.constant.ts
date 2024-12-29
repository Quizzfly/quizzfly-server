import { ErrorCode } from '@core/constants/error-code/error-code.constant';

export const ResourceLimitErrorCode: Record<string, string> = {
  [ErrorCode.RESOURCE_LIMIT_NOT_FOUND]: 'resourceLimit.error.not_found',
  [ErrorCode.RESOURCE_LIMIT_ALREADY_EXISTS]:
    'resourceLimit.error.already_exists',
};
