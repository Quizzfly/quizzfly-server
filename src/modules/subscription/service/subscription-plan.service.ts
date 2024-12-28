import { Uuid } from '@common/types/common.type';
import { ErrorCode } from '@core/constants/error-code/error-code.constant';
import { Optional } from '@core/utils/optional';
import { CreateSubscriptionPlanReqDto } from '@modules/subscription/dto/request/create-subscription-plan.req.dto';
import { SubscriptionPlanResDto } from '@modules/subscription/dto/response/subscription-plan.res.dto';
import { SubscriptionPlanEntity } from '@modules/subscription/entity/subscription-plan.entity';
import { SubscriptionPlanRepository } from '@modules/subscription/repository/subscription-plan.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class SubscriptionPlanService {
  constructor(
    private readonly subscriptionPlanRepository: SubscriptionPlanRepository,
  ) {}

  async createSubscriptionPlan(dto: CreateSubscriptionPlanReqDto) {
    const subscription = new SubscriptionPlanEntity({
      ...dto,
    });
    await this.subscriptionPlanRepository.save(subscription);
    return subscription.toDto(SubscriptionPlanResDto);
  }

  async findById(id: Uuid) {
    return Optional.of(
      await this.subscriptionPlanRepository.findOne({
        where: { id },
      }),
    )
      .throwIfNotPresent(
        new NotFoundException(ErrorCode.SUBSCRIPTION_PLAN_NOT_FOUND),
      )
      .get();
  }

  async updateSubscriptionPlan(id: Uuid, dto: CreateSubscriptionPlanReqDto) {
    const subscription = await this.findById(id);
    Object.assign(subscription, dto);
    await this.subscriptionPlanRepository.save(subscription);

    return subscription.toDto(SubscriptionPlanResDto);
  }

  async deleteSubscriptionPlan(id: Uuid) {
    const subscription = await this.findById(id);
    await this.subscriptionPlanRepository.softDelete({ id: id });
  }

  async getListSubscriptionPlan() {
    const subscriptions = await this.subscriptionPlanRepository.find();

    return plainToInstance(SubscriptionPlanResDto, subscriptions, {
      excludeExtraneousValues: true,
    });
  }
}
