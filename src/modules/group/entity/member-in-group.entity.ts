import { Uuid } from '@common/types/common.type';
import { AbstractEntity } from '@database/entities/abstract.entity';
import { GroupEntity } from '@modules/group/entity/group.entity';
import { RoleInGroup } from '@modules/group/enums/role-in-group.enum';
import { UserEntity } from '@modules/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity('member_in_group', { schema: 'public' })
export class MemberInGroupEntity extends AbstractEntity {
  constructor(data?: Partial<MemberInGroupEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_member_in_group_id',
  })
  id!: Uuid;

  @Column({ type: 'enum', name: 'role', enum: RoleInGroup })
  role?: RoleInGroup;

  @Column({
    name: 'group_id',
    type: 'uuid',
  })
  groupId!: Uuid;

  @JoinColumn({
    name: 'group_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_group_member_in_group',
  })
  @ManyToOne(() => GroupEntity, (group) => group.memberInGroups)
  group: Relation<GroupEntity>;

  @Column({
    name: 'member_id',
    type: 'uuid',
  })
  memberId!: Uuid;

  @JoinColumn({
    name: 'member_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_member_member_in_group',
  })
  @ManyToOne(() => UserEntity, (member) => member.memberInGroups)
  member: Relation<UserEntity>;
}
