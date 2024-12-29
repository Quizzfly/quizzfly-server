import { Uuid } from '@common/types/common.type';
import { Order } from '@core/constants/app.constant';
import { ErrorCode } from '@core/constants/error-code/error-code.constant';
import { Optional } from '@core/utils/optional';
import { CreateSubscriptionPlanReqDto } from '@modules/subscription/dto/request/create-subscription-plan.req.dto';
import { UpdateSubscriptionPlanReqDto } from '@modules/subscription/dto/request/update-subscription-plan.req.dto';
import { SubscriptionPlanResDto } from '@modules/subscription/dto/response/subscription-plan.res.dto';
import { SubscriptionPlanEntity } from '@modules/subscription/entity/subscription-plan.entity';
import { SubscriptionPlanRepository } from '@modules/subscription/repository/subscription-plan.repository';
import { ResourceLimitService } from '@modules/subscription/service/resource-limit.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { FindOptionsRelations } from 'typeorm';

@Injectable()
export class SubscriptionPlanService {
  constructor(
    private readonly subscriptionPlanRepository: SubscriptionPlanRepository,
    private readonly resourceLimitService: ResourceLimitService,
  ) {}

  async createSubscriptionPlan(dto: CreateSubscriptionPlanReqDto) {
    const subscription = new SubscriptionPlanEntity({
      name: dto.name,
      description: dto.description,
      duration: dto.duration,
      price: dto.price,
    });
    await this.subscriptionPlanRepository.save(subscription);

    if (dto.resourceLimits && dto.resourceLimits.length > 0) {
      const resourceLimitSaved =
        await this.resourceLimitService.storeMultipleResourceLimit(
          subscription.id,
          dto.resourceLimits,
        );

      subscription.resourceLimits = resourceLimitSaved;
    }
    return subscription.toDto(SubscriptionPlanResDto);
  }

  async findById(
    id: Uuid,
    relations?: FindOptionsRelations<SubscriptionPlanEntity>,
  ) {
    return Optional.of(
      await this.subscriptionPlanRepository.findOne({
        where: { id },
        relations: relations,
      }),
    )
      .throwIfNotPresent(
        new NotFoundException(ErrorCode.SUBSCRIPTION_PLAN_NOT_FOUND),
      )
      .get() as SubscriptionPlanEntity;
  }

  async updateSubscriptionPlan(id: Uuid, dto: UpdateSubscriptionPlanReqDto) {
    const subscription = await this.findById(id);
    Object.assign(subscription, dto);
    await this.subscriptionPlanRepository.save(subscription);

    return subscription.toDto(SubscriptionPlanResDto);
  }

  async deleteSubscriptionPlan(id: Uuid) {
    await this.findById(id);
    await this.subscriptionPlanRepository.softDelete({ id: id });
  }

  async getListSubscriptionPlan() {
    const subscriptions = await this.subscriptionPlanRepository.find({
      relations: { resourceLimits: true },
      order: {
        price: Order.ASC,
      },
    });

    return plainToInstance(SubscriptionPlanResDto, subscriptions, {
      excludeExtraneousValues: true,
    });
  }
}
