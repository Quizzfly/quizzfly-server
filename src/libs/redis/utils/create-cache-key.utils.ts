import * as util from 'node:util';
import { CacheKey } from '@core/constants/cache.constant';

export const CreateCacheKey = (key: CacheKey, ...args: string[]): string => {
  return util.format(key, ...args);
};
