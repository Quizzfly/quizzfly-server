import { Uuid } from '@common/types/common.type';
import { AbstractEntity } from '@database/entities/abstract.entity';
import { UserPlanEntity } from '@modules/subscription/entity/user-plan.entity';
import { ResourceType } from '@modules/subscription/enum/resource-type.enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('usage_resource', { schema: 'public' })
export class UsageResourceEntity extends AbstractEntity {
  constructor(data?: Partial<UsageResourceEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_usage_resource_id',
  })
  id!: Uuid;

  @Column()
  usage: number;

  @Column({
    type: 'enum',
    enum: ResourceType,
    name: 'resource_type',
  })
  resourceType: ResourceType;

  @Column({
    name: 'user_plan_id',
  })
  userPlanId: Uuid;

  @JoinColumn({ name: 'user_plan_id' })
  @ManyToOne('UserPlanEntity', 'usageResources')
  userPlan: UserPlanEntity;
}
