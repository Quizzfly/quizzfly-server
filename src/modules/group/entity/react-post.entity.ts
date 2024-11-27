import { Uuid } from '@common/types/common.type';
import { AbstractEntity } from '@database/entities/abstract.entity';
import { PostEntity } from '@modules/group/entity/post.entity';
import { UserEntity } from '@modules/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity('react_post', { schema: 'public' })
export class ReactPostEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_react_post_id',
  })
  id!: Uuid;

  @Column({
    name: 'member_id',
    type: 'uuid',
  })
  memberId!: Uuid;

  @JoinColumn({
    name: 'member_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_member_react_post',
  })
  @ManyToOne('UserEntity', 'reactPosts')
  member: Relation<UserEntity>;

  @Column({
    name: 'post_id',
    type: 'uuid',
  })
  postId!: Uuid;

  @JoinColumn({
    name: 'post_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_group_post',
  })
  @ManyToOne('PostEntity', 'reactPosts')
  post: Relation<PostEntity>;

  constructor(data?: Partial<ReactPostEntity>) {
    super();
    Object.assign(this, data);
  }
}
