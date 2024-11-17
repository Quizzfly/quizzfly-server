import { ErrorCode } from '@core/constants/error-code/error-code.constant';

export const AuthErrorCode: Record<string, string> = {
  [ErrorCode.INVALID_CREDENTIALS]: 'auth.error.invalid_credentials',
  [ErrorCode.UNAUTHORIZED]: 'auth.error.unauthorized',
  [ErrorCode.TOKEN_EXPIRED]: 'auth.error.token_expired',
  [ErrorCode.TOKEN_INVALID]: 'auth.error.token_invalid',
  [ErrorCode.ACCESS_DENIED]: 'auth.error.access_denied',
  [ErrorCode.REFRESH_TOKEN_INVALID]: 'auth.error.refresh_token_invalid',
  [ErrorCode.ACCOUNT_LOCKED]: 'auth.error.account_locked',
  [ErrorCode.ACCOUNT_DISABLED]: 'auth.error.account_disabled',
  [ErrorCode.FORBIDDEN]: 'auth.error.forbidden',
  [ErrorCode.ACCOUNT_NOT_ACTIVATED]: 'auth.error.account_not_activate',
  [ErrorCode.ACCOUNT_ALREADY_ACTIVATED]: 'auth.error.account_already_activated',
  [ErrorCode.ACCOUNT_NOT_REGISTER]: 'auth.error.account_not_registered',
  [ErrorCode.OLD_PASSWORD_INCORRECT]: 'auth.error.old_password_is_incorrect',
};
