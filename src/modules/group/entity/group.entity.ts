import { AbstractEntity } from '@database/entities/abstract.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Uuid } from '@common/types/common.type';
import { MemberInGroupEntity } from '@modules/group/entity/member-in-group.entity';

@Entity('group', { schema: 'public' })
export class GroupEntity extends AbstractEntity {

  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_group_id',
  })
  id!: Uuid;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  background: string;

  @OneToMany(() => MemberInGroupEntity, (memberInGroup) => memberInGroup.group)
  memberInGroups?: MemberInGroupEntity[];

  constructor(data?: Partial<GroupEntity>) {
    super();
    Object.assign(this, data);
  }
}
