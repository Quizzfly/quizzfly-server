import { Uuid } from '@common/types/common.type';
import { AbstractEntity } from '@database/entities/abstract.entity';
import { SubscriptionPlanEntity } from '@modules/subscription/entity/subscription-plan.entity';
import { UsageResourceEntity } from '@modules/subscription/entity/usage-resource.entity';
import { UserPlanStatus } from '@modules/subscription/enum/user-plan-status.enum';
import { UserEntity } from '@modules/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('user_plan', { schema: 'public' })
export class UserPlanEntity extends AbstractEntity {
  constructor(data?: Partial<UserPlanEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_user_plan_id',
  })
  id!: Uuid;

  @Column()
  amount: number;

  @Column()
  description: string;

  @Column()
  code: string;

  @Column({
    type: 'enum',
    enum: UserPlanStatus,
    name: 'user_plan_status',
  })
  userPlanStatus: UserPlanStatus;

  @Column({ name: 'paymented_at' })
  paymentedAt: string;

  @Column({ name: 'subscription_expired_at' })
  subscriptionExpiredAt: Date;

  @Column({
    name: 'subscription_plan_id',
  })
  subscriptionPlanId: Uuid;

  @Column({
    name: 'user_id',
  })
  userId: Uuid;

  @JoinColumn({ name: 'subscription_plan_id' })
  @ManyToOne('SubscriptionPlanEntity', 'userPlans', { eager: true })
  subscriptionPlan: SubscriptionPlanEntity;

  @JoinColumn({ name: 'user_id' })
  @ManyToOne('UserEntity', 'userPlans')
  user: UserEntity;

  @OneToMany('UsageResourceEntity', 'userPlan')
  usageResources?: UsageResourceEntity[];
}
