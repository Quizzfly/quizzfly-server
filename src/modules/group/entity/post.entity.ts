import { Uuid } from '@common/types/common.type';
import { AbstractEntity } from '@database/entities/abstract.entity';
import { FileResDto } from '@modules/file/dto/file.res.dto';
import { CommentPostEntity } from '@modules/group/entity/comment-post.entity';
import { GroupEntity } from '@modules/group/entity/group.entity';
import { ReactPostEntity } from '@modules/group/entity/react-post.entity';
import { PostType } from '@modules/group/enums/post-type.enum';
import { QuizzflyEntity } from '@modules/quizzfly/entity/quizzfly.entity';
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

@Entity('post', { schema: 'public' })
export class PostEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_post_id',
  })
  id!: Uuid;

  @Column({ type: 'enum', name: 'type', enum: PostType })
  type?: PostType;

  @Column()
  content: string;

  @Column('jsonb', { default: [] })
  files?: FileResDto[];

  @Column({
    name: 'group_id',
    type: 'uuid',
  })
  groupId!: Uuid;

  @JoinColumn({
    name: 'group_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_group_post',
  })
  @ManyToOne('GroupEntity', 'posts')
  group: Relation<GroupEntity>;

  @Column({
    name: 'quizzfly_id',
    type: 'uuid',
  })
  quizzflyId!: Uuid;

  @JoinColumn({
    name: 'quizzfly_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_quizzfly _post',
  })
  @ManyToOne('QuizzflyEntity', 'posts')
  quizzfly: Relation<QuizzflyEntity>;

  @Column({
    name: 'member_id',
    type: 'uuid',
  })
  memberId!: Uuid;

  @JoinColumn({
    name: 'member_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_member_post',
  })
  @ManyToOne('UserEntity', 'posts')
  member: Relation<UserEntity>;

  @OneToMany('ReactPostEntity', 'post')
  reactPosts?: ReactPostEntity[];

  @OneToMany('CommentPostEntity', 'post')
  commentPosts?: CommentPostEntity[];

  constructor(data?: Partial<PostEntity>) {
    super();
    Object.assign(this, data);
  }
}
