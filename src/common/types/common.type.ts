import { Branded } from './types';

export type Uuid = Branded<string, 'Uuid'>;

export type MaybeType<T> = T | undefined;

export type NullableType<T> = T | null;
