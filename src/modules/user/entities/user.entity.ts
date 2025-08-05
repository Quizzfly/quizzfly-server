import { Uuid } from '@common/types/common.type';
import { hashPassword as hashPass } from '@core/utils/password.util';
import { AbstractEntity } from '@database/entities/abstract.entity';
import { CommentPostEntity } from '@modules/group/entity/comment-post.entity';
import { MemberInGroupEntity } from '@modules/group/entity/member-in-group.entity';
import { PostEntity } from '@modules/group/entity/post.entity';
import { ReactPostEntity } from '@modules/group/entity/react-post.entity';
import { QuizzflyEntity } from '@modules/quizzfly/entity/quizzfly.entity';
import { RoleEntity } from '@modules/role/entities/role.entity';
import { ParticipantInRoomEntity } from '@modules/room/entities/participant-in-room.entity';
import { RoomEntity } from '@modules/room/entities/room.entity';
import { SessionEntity } from '@modules/session/entities/session.entity';
import { UserPlanEntity } from '@modules/subscription/entity/user-plan.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { UserInfoEntity } from './user-info.entity';

@Entity('user', { schema: 'public' })
export class UserEntity extends AbstractEntity {
  constructor(data?: Partial<UserEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_user_id' })
  id!: Uuid;

  @Column()
  @Index('UQ_user_email', { where: '"deleted_at" IS NULL', unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ name: 'is_active', type: 'boolean', default: false })
  isActive?: boolean;

  @Column({ name: 'is_confirmed', type: 'boolean', default: false })
  isConfirmed?: boolean;

  @Column({ name: 'role_id', type: 'uuid' })
  roleId: Uuid;

  @OneToOne(() => RoleEntity)
  @JoinColumn({
    name: 'role_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_user_role',
  })
  role: RoleEntity;

  @OneToMany(() => SessionEntity, (session) => session.user)
  sessions?: Relation<SessionEntity>[];

  @OneToMany('QuizzflyEntity', 'user')
  quizzflies?: Relation<QuizzflyEntity>[];

  @OneToMany('RoomEntity', 'user')
  rooms?: Relation<RoomEntity>[];

  @OneToMany(() => MemberInGroupEntity, (member) => member.member)
  memberInGroups?: Relation<MemberInGroupEntity>[];

  @OneToMany('PostEntity', 'member')
  posts?: Relation<PostEntity>[];

  @OneToMany('ReactPostEntity', 'member')
  reactPosts?: Relation<ReactPostEntity>[];

  @OneToMany('CommentPostEntity', 'member')
  commentPosts?: Relation<CommentPostEntity>[];

  @OneToMany('UserPlanEntity', 'user')
  userPlans?: Relation<UserPlanEntity>[];

  @OneToOne(() => UserInfoEntity, (userInfo) => userInfo.user, { eager: true })
  userInfo?: Relation<UserInfoEntity>;

  @OneToMany(
    () => ParticipantInRoomEntity,
    (participantInRoom) => participantInRoom.user,
  )
  participantInRooms?: Relation<ParticipantInRoomEntity>[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await hashPass(this.password);
    }
  }
}
