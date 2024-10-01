import { Uuid } from '@common/types/common.type';
import { AbstractEntity } from '@database/entities/abstract.entity';
import { UserEntity } from '@modules/user/entities/user.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity('user_info', { schema: 'public' })
export class UserInfoEntity extends AbstractEntity {
  constructor(data?: Partial<UserInfoEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_user_info_id',
  })
  id!: Uuid;

  @Column({
    length: 50,
    nullable: true,
  })
  @Index('UQ_user_info_username', {
    where: '"deleted_at" IS NULL',
    unique: true,
  })
  username!: string;

  @Column({
    length: 50,
    nullable: true,
  })
  name: string;

  @Column({
    length: 255,
    nullable: true,
  })
  avatar: string;

  @Column({
    name: 'user_id',
    type: 'uuid',
  })
  userId: Uuid;

  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_user_info_user',
  })
  @OneToOne(() => UserEntity, (user) => user.userInfo)
  user!: Relation<UserEntity>;
}
