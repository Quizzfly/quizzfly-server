import { Uuid } from '@common/types/common.type';
import { AbstractEntity } from '@database/entities/abstract.entity';
import { TargetType } from '@modules/notification/enums/target-type.enum';
import { UserEntity } from '@modules/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { NotificationType } from '../enums/notification-type.enum';

@Entity('notification', { schema: 'public' })
export class NotificationEntity extends AbstractEntity {
  constructor(data?: Partial<NotificationEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_notification_id',
  })
  id!: Uuid;

  @Column()
  content: string;

  @Column()
  description: string;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead?: boolean;

  @Column({ name: 'object_id', type: 'uuid' })
  objectId: Uuid;

  @Column({ name: 'target_id', type: 'uuid' })
  targetId: Uuid;

  @Column({ name: 'target_type', type: 'enum', enum: TargetType })
  targetType: TargetType;

  @Column({ name: 'notification_type', type: 'enum', enum: NotificationType })
  notificationType: NotificationType;

  @Column({ name: 'agent_id', type: 'uuid' })
  agentId!: Uuid;

  @JoinColumn({ name: 'agent_id' })
  @ManyToOne('UserEntity', 'notifications', { eager: true })
  agent: Relation<UserEntity>;

  @Column({ name: 'receiver_id', type: 'uuid' })
  receiverId!: Uuid;

  @JoinColumn({ name: 'receiver_id' })
  @ManyToOne('UserEntity', 'notifications')
  receiver: Relation<UserEntity>;
}
