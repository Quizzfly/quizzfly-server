import { Uuid } from '@common/types/common.type';
import { ActionList, ResourceList } from '@core/constants/app.constant';
import { AbstractEntity } from '@database/entities/abstract.entity';
import { RoleEntity } from '@modules/role/entities/role.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('permission', { schema: 'public' })
export class PermissionEntity extends AbstractEntity {
  constructor(data?: Partial<PermissionEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_permission_id',
  })
  id!: Uuid;

  @Column('varchar', { length: 100 })
  resource!: ResourceList;

  @Column('varchar', { length: 100 })
  action!: ActionList;

  @Column('varchar', { length: 100 })
  name!: string;

  @Column()
  description: string;

  @ManyToMany(() => RoleEntity, (role) => role.permissions)
  roles: RoleEntity[];
}
