import { Uuid } from '@common/types/common.type';
import { ROLE } from '@core/constants/entity.enum';
import { hashPassword as hashPass } from '@core/utils/password.util';
import { AbstractEntity } from '@database/entities/abstract.entity';
import { QuizzflyEntity } from '@modules/quizzfly/entity/quizzfly.entity';
import { RoomEntity } from '@modules/room/entity/room.entity';
import { SessionEntity } from '@modules/session/entities/session.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
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

  @Column({ type: 'enum', name: 'role', enum: ROLE, default: ROLE.USER })
  role?: ROLE;

  @Column({ name: 'is_active', type: 'boolean', default: false })
  isActive?: boolean;

  @Column({ name: 'is_confirmed', type: 'boolean', default: false })
  isConfirmed?: boolean;

  @OneToMany(() => SessionEntity, (session) => session.user)
  sessions?: SessionEntity[];

  @OneToMany('QuizzflyEntity', 'user')
  quizzflys?: QuizzflyEntity[];

  @OneToMany('RoomEntity', 'user')
  rooms?: RoomEntity[];

  @OneToOne(() => UserInfoEntity, (userInfo) => userInfo.user)
  userInfo?: UserInfoEntity;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await hashPass(this.password);
    }
  }
}
