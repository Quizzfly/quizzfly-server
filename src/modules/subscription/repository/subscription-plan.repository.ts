import { SubscriptionPlanEntity } from '@modules/subscription/entity/subscription-plan.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class SubscriptionPlanRepository extends Repository<SubscriptionPlanEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(SubscriptionPlanEntity, dataSource.createEntityManager());
  }
}
