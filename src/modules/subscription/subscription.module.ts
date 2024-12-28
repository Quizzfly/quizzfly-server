import { ResourceLimitController } from '@modules/subscription/controller/resource-limit.controller';
import { SubscriptionPlanController } from '@modules/subscription/controller/subscription-plan.controller';
import { ResourceLimitEntity } from '@modules/subscription/entity/resource-limit.entity';
import { SubscriptionPlanEntity } from '@modules/subscription/entity/subscription-plan.entity';
import { ResourceLimitRepository } from '@modules/subscription/repository/resource-limit.repository';
import { SubscriptionPlanRepository } from '@modules/subscription/repository/subscription-plan.repository';
import { ResourceLimitService } from '@modules/subscription/service/resource-limit.service';
import { SubscriptionPlanService } from '@modules/subscription/service/subscription-plan.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubscriptionPlanEntity, ResourceLimitEntity]),
  ],
  controllers: [SubscriptionPlanController, ResourceLimitController],
  providers: [
    SubscriptionPlanRepository,
    SubscriptionPlanService,
    ResourceLimitRepository,
    ResourceLimitService,
  ],
  exports: [],
})
export class SubscriptionModule {}
