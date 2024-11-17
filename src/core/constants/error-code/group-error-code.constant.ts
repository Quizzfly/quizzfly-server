import { ErrorCode } from '@core/constants/error-code/error-code.constant';

export const GroupErrorCode: Record<string, string> = {
  [ErrorCode.GROUP_NOT_FOUND]: 'group.error.not_found',
  [ErrorCode.USER_IS_ALREADY_IN_GROUP]: 'group.error.user_is_already_in_group',
};
