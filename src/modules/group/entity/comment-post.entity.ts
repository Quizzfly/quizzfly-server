import { Uuid } from '@common/types/common.type';
import { AbstractEntity } from '@database/entities/abstract.entity';
import { FileResDto } from '@modules/file/dto/file.res.dto';
import { GroupEntity } from '@modules/group/entity/group.entity';
import { UserEntity } from '@modules/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity('comment_post', { schema: 'public' })
export class CommentPostEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_comment_post_id',
  })
  id!: Uuid;

  @Column()
  content: string;

  @Column('jsonb', { default: [] })
  files?: FileResDto[];

  @Column({
    name: 'member_id',
    type: 'uuid',
  })
  memberId!: Uuid;

  @JoinColumn({
    name: 'member_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_member_comment_post',
  })
  @ManyToOne('UserEntity', 'posts')
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
  @ManyToOne('GroupEntity', 'posts')
  group: Relation<GroupEntity>;

  constructor(data?: Partial<CommentPostEntity>) {
    super();
    Object.assign(this, data);
  }
}
