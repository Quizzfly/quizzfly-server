import { ActionList, ResourceList } from '@core/constants/app.constant';
import { IEvent } from '@core/events/event.interface';
import { RoleEntity } from '@modules/role/entities/role.entity';
import { FindOptionsWhere } from 'typeorm';

export class GetRoleEvent implements IEvent<FindOptionsWhere<RoleEntity>> {
  readonly scope = ResourceList.ROLE;
  readonly name = ActionList.READ;

  constructor(readonly payload: FindOptionsWhere<RoleEntity>) {}
}
