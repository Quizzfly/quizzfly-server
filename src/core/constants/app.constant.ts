export const IS_PUBLIC = 'isPublic';
export const IS_AUTH_OPTIONAL = 'isAuthOptional';

export enum Environment {
  LOCAL = 'local',
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TEST = 'test',
}

export enum LogService {
  CONSOLE = 'console',
  GOOGLE_LOGGING = 'google_logging',
  AWS_CLOUDWATCH = 'aws_cloudwatch',
}

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

// Redact value of these paths from logs
export const loggingRedactPaths = [
  'req.headers.authorization',
  'req.body.token',
  'req.body.refreshToken',
  'req.body.email',
  'req.body.password',
  'req.body.oldPassword',
];

export const DEFAULT_PAGE_LIMIT = 20;
export const DEFAULT_CURRENT_PAGE = 1;
export const SYSTEM_USER_ID = 'system';
export const SUCCESS = 'success';
export const FAILURE = 'failure';
export const defaultInstanceEntity = Object.freeze({
  id: undefined,
  createdAt: undefined,
  updatedAt: undefined,
  deletedAt: null,
});

export const defaultCreateEntity = Object.freeze({
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
});

export const GOOGLE_URL =
  'https://www.googleapis.com/oauth2/v1/userinfo?access_token=';
