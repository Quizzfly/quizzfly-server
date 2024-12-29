import { PageOptionsDto } from '@common/dto/offset-pagination/page-options.dto';
import { Uuid } from '@common/types/common.type';
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

  async findUserPlanByCode(code: string) {
    return this.findOneBy({
      code: code,
    });
  }

  async getMyUserPlan(userId: Uuid, filterOptions: PageOptionsDto) {
    const skip = filterOptions.page
      ? (filterOptions.page - 1) * filterOptions.limit
      : 0;

    const query = this.createQueryBuilder('userPlan')
      .where('userPlan.userId = :userId', { userId })
      .orderBy('userPlan.createdAt', filterOptions.order)
      .offset(skip)
      .limit(filterOptions.limit);

    return await query.getMany();
  }
}
