import { MaybeType } from '@common/types/common.type';
import { type TransformFnParams } from 'class-transformer';

export const snakeCaseTransformer = (
  params: TransformFnParams,
): MaybeType<string> => {
  return params.value
    ? params.value
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .toLowerCase()
        .trim()
    : undefined;
};
