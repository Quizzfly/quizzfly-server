export enum ErrorCode {
  // Common Validation
  V000 = 'common.validation.error',

  // Validation
  V001 = 'user.validation.is_empty',
  V002 = 'user.validation.is_invalid',
  V003 = 'file.validation.is_empty',

  // Error
  E001 = 'user.error.username_or_email_exists',
  E002 = 'user.error.not_found',
  E003 = 'user.error.email_exists',

  // Authentication Errors
  A001 = 'auth.error.invalid_credentials',
  A002 = 'auth.error.unauthorized',
  A003 = 'auth.error.token_expired',
  A004 = 'auth.error.token_invalid',
  A005 = 'auth.error.access_denied',
  A006 = 'auth.error.refresh_token_invalid',
  A007 = 'auth.error.account_locked',
  A008 = 'auth.error.account_disabled',
}
