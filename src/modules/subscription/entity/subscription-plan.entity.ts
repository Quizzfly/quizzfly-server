import { Uuid } from '@common/types/common.type';
import { AbstractEntity } from '@database/entities/abstract.entity';
import { ResourceLimitEntity } from '@modules/subscription/entity/resource-limit.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('subscription_plan', { schema: 'public' })
export class SubscriptionPlanEntity extends AbstractEntity {
  constructor(data?: Partial<SubscriptionPlanEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_subscription_plan_id',
  })
  id!: Uuid;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  duration: number;

  @Column()
  price: number;

  @OneToMany('ResourceLimitEntity', 'subscriptionPlan')
  resourceLimits?: ResourceLimitEntity[];
}
