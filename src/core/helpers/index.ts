import * as process from 'process';

export const getEnvFilePath = (): string => {
  const ENV = process.env.NODE_ENV;
  if (ENV === 'development') return '.env.development';
  if (ENV === 'production') return '.env.production';

  return '.env';
};
