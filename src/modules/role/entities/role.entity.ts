import { Uuid } from '@common/types/common.type';
import { PermissionEntity } from '@modules/permission/entities/permission.entity';
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('role', { schema: 'public' })
export class RoleEntity extends BaseEntity {
  constructor(data?: Partial<RoleEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_role_id' })
  id!: Uuid;

  @Column('varchar', { length: 100 })
  @Index('UQ_role_name', { where: '"deleted_at" IS NULL', unique: true })
  name!: string;

  @Column()
  description: string;

  @ManyToMany('PermissionEntity', 'roles')
  @JoinTable({
    name: 'role_permission',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
    },
  })
  permissions: Array<PermissionEntity>;
}
