import { ErrorCode } from '@core/constants/error-code/error-code.constant';

export const UserErrorCode: Record<string, string> = {
  [ErrorCode.USERNAME_OR_EMAIL_EXISTS]: 'user.error.username_or_email_exists',
  [ErrorCode.USER_NOT_FOUND]: 'user.error.not_found',
  [ErrorCode.EMAIL_EXISTS]: 'user.error.email_exists',
  [ErrorCode.CODE_INCORRECT]: 'user.error.code_is_incorrect',
  [ErrorCode.REQUEST_DELETE_ACCOUNT_INVALID]:
    'user.error.request_delete_account_is_invalid',
};
