export enum ErrorCode {
  // Validation Errors
  COMMON = 'V000',
  FILE_NOT_EMPTY = 'V001',

  // User Errors
  USERNAME_OR_EMAIL_EXISTS = 'USER_001',
  USER_NOT_FOUND = 'USER_002',
  EMAIL_EXISTS = 'USER_003',
  CODE_INCORRECT = 'USER_004',
  REQUEST_DELETE_ACCOUNT_INVALID = 'USER_005',

  // Authentication Errors
  INVALID_CREDENTIALS = 'AUTH_001',
  UNAUTHORIZED = 'AUTH_002',
  TOKEN_EXPIRED = 'AUTH_003',
  TOKEN_INVALID = 'AUTH_004',
  ACCESS_DENIED = 'AUTH_005',
  REFRESH_TOKEN_INVALID = 'AUTH_006',
  ACCOUNT_LOCKED = 'AUTH_007',
  ACCOUNT_DISABLED = 'AUTH_008',
  FORBIDDEN = 'AUTH_009',
  ACCOUNT_NOT_ACTIVATED = 'AUTH_010',
  ACCOUNT_ALREADY_ACTIVATED = 'AUTH_011',
  ACCOUNT_NOT_REGISTER = 'AUTH_012',
  OLD_PASSWORD_INCORRECT = 'AUTH_013',

  // Quizzfly Errors
  QUIZZFLY_NOT_FOUND = 'QUIZZFLY_001',

  // Slide Errors
  SLIDE_NOT_FOUND = 'SLIDE_001',

  // Quiz Errors
  QUIZ_NOT_FOUND = 'QUIZ_001',

  // Room Errors
  ROOM_NOT_FOUND = 'ROOM_001',

  // Group Errors
  GROUP_NOT_FOUND = 'GROUP_001',
  USER_IS_ALREADY_IN_GROUP = 'GROUP_002',

  // Post Errors
  POST_NOT_FOUND = 'POST_001',

  // Comment Errors
  COMMENT_NOT_FOUND = 'COMMENT_001',

  // Notification Errors
  NOTIFICATION_NOT_FOUND = 'NOTIFICATION_001',
}

export const CommonError: Record<string, string> = {
  [ErrorCode.COMMON]: 'common.validation.error',
  [ErrorCode.FILE_NOT_EMPTY]: 'file.validation.is_empty',
};
