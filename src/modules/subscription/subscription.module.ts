import { ResourceLimitController } from '@modules/subscription/controller/resource-limit.controller';
import { SubscriptionPlanController } from '@modules/subscription/controller/subscription-plan.controller';
import { UserPlanController } from '@modules/subscription/controller/user-plan.controller';
import { ResourceLimitEntity } from '@modules/subscription/entity/resource-limit.entity';
import { SubscriptionPlanEntity } from '@modules/subscription/entity/subscription-plan.entity';
import { UserPlanEntity } from '@modules/subscription/entity/user-plan.entity';
import { ResourceLimitRepository } from '@modules/subscription/repository/resource-limit.repository';
import { SubscriptionPlanRepository } from '@modules/subscription/repository/subscription-plan.repository';
import { UserPlanRepository } from '@modules/subscription/repository/user-plan.repository';
import { ResourceLimitService } from '@modules/subscription/service/resource-limit.service';
import { SubscriptionPlanService } from '@modules/subscription/service/subscription-plan.service';
import { UserPlanService } from '@modules/subscription/service/user-plan.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SubscriptionPlanEntity,
      ResourceLimitEntity,
      UserPlanEntity,
    ]),
  ],
  controllers: [
    SubscriptionPlanController,
    ResourceLimitController,
    UserPlanController,
  ],
  providers: [
    SubscriptionPlanRepository,
    SubscriptionPlanService,
    ResourceLimitRepository,
    ResourceLimitService,
    UserPlanRepository,
    UserPlanService,
  ],
  exports: [],
})
export class SubscriptionModule {}
