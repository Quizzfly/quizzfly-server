import { Uuid } from '@common/types/common.type';
import { AbstractEntity } from '@database/entities/abstract.entity';
import { SubscriptionPlanEntity } from '@modules/subscription/entity/subscription-plan.entity';
import { ResourceType } from '@modules/subscription/enum/resource-type.enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('resource_limit', { schema: 'public' })
export class ResourceLimitEntity extends AbstractEntity {
  constructor(data?: Partial<ResourceLimitEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_resource_limit_id',
  })
  id!: Uuid;

  @Column()
  name: string;

  @Column()
  limit: number;

  @Column({
    type: 'enum',
    enum: ResourceType,
    name: 'resource_type',
  })
  resourceType: ResourceType;

  @Column({
    name: 'subscription_plan_id',
  })
  subscriptionPlanId: Uuid;

  @JoinColumn({ name: 'subscription_plan_id' })
  @ManyToOne('SubscriptionPlanEntity', 'resourceLimits')
  subscriptionPlan: SubscriptionPlanEntity;
}
