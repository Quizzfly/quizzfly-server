import { Uuid } from '@common/types/common.type';
import { AbstractEntity } from '@database/entities/abstract.entity';
import { MemberInGroupEntity } from '@modules/group/entity/member-in-group.entity';
import { PostEntity } from '@modules/group/entity/post.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

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

  @OneToMany(() => PostEntity, (post) => post.group)
  posts?: PostEntity[];

  constructor(data?: Partial<GroupEntity>) {
    super();
    Object.assign(this, data);
  }
}
