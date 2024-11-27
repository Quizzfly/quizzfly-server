import { Uuid } from '@common/types/common.type';
import { AbstractEntity } from '@database/entities/abstract.entity';
import { FileResDto } from '@modules/file/dto/file.res.dto';
import { PostEntity } from '@modules/group/entity/post.entity';
import { UserEntity } from '@modules/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
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
  @ManyToOne('UserEntity', 'commentPosts')
  member: Relation<UserEntity>;

  @Column({
    name: 'post_id',
    type: 'uuid',
  })
  postId!: Uuid;

  @JoinColumn({
    name: 'post_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_post_comment_post',
  })
  @ManyToOne('PostEntity', 'commentPosts')
  post: Relation<PostEntity>;

  @Column({
    name: 'parent_comment_id',
    type: 'uuid',
    nullable: true,
  })
  parentCommentId?: Uuid;

  @JoinColumn({
    name: 'parent_comment_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_parent_comment_post',
  })
  @ManyToOne(() => CommentPostEntity, (comment) => comment.childComments, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  parentComment?: Relation<CommentPostEntity>;

  @OneToMany(() => CommentPostEntity, (comment) => comment.parentComment)
  childComments?: Relation<CommentPostEntity[]>;

  constructor(data?: Partial<CommentPostEntity>) {
    super();
    Object.assign(this, data);
  }
}
