import validateConfig from '@core/utils/validate-config';
import { FileConfig } from '@modules/file/config/file-config.type';
import { registerAs } from '@nestjs/config';
import { IsString } from 'class-validator';
import process from 'node:process';

class EnvironmentVariablesValidator {
  @IsString()
  CLOUD_NAME: string;

  @IsString()
  API_KEY: string;

  @IsString()
  API_SECRET: string;
}

export default registerAs<FileConfig>('file', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    cloudName: process.env.CLOUD_NAME,
    apiKey: process.env.API_KEY,
    apiSecret: process.env.API_SECRET,
  };
});
