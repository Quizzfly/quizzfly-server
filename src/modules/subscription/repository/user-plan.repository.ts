import { UserPlanEntity } from '@modules/subscription/entity/user-plan.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class UserPlanRepository extends Repository<UserPlanEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(UserPlanEntity, dataSource.createEntityManager());
  }

  async findLatestCodeUserPlan() {
    return this.createQueryBuilder('userPlan')
      .select(['userPlan.code'])
      .orderBy('userPlan.createdAt', 'DESC')
      .getOne();
  }
}
