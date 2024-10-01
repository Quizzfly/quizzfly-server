import { AbstractEntity } from '@database/entities/abstract.entity';
import { BaseInterfaceService } from '@shared/services/base/base.interface.service';
import { DeleteResult, Repository } from 'typeorm';
import { EntityId } from 'typeorm/repository/EntityId';

export class BaseAbstractService<
  T extends AbstractEntity,
  R extends Repository<T>,
> implements BaseInterfaceService<T>
{
  constructor(private readonly repository: R) {}

  async create(item: T | any): Promise<T> {
    return this.repository.save(item);
  }

  async update(id: EntityId, data: any): Promise<T> {
    await this.repository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: EntityId): Promise<DeleteResult> {
    return this.repository.softDelete(id);
  }

  async findOne(id: EntityId): Promise<T> {
    // @ts-ignore
    return this.repository.findOne(id);
  }

  async findOneByCondition(filter: Partial<T>): Promise<T> {
    // @ts-ignore
    return this.repository.findOne(filter);
  }

  async findAll(): Promise<T[]> {
    return this.repository.find();
  }
}
