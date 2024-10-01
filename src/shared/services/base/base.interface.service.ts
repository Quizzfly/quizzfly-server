import { DeleteResult } from 'typeorm';
import { EntityId } from 'typeorm/repository/EntityId';

export interface Write<T> {
  create(item: T | any): Promise<T>;

  update(id: EntityId, item: Partial<T>): Promise<T>;

  remove(id: EntityId): Promise<DeleteResult>;
}

export interface Read<T> {
  findAll(filter?: object, options?: object): Promise<T[]>;

  findOne(id: EntityId): Promise<T>;

  findOneByCondition(filter: any): Promise<T>;
}

export interface BaseInterfaceService<T> extends Write<T>, Read<T> {}
