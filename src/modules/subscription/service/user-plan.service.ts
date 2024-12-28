import { Uuid } from '@common/types/common.type';
import { UserPlanResDto } from '@modules/subscription/dto/response/user-plan.res.dto';
import { UserPlanEntity } from '@modules/subscription/entity/user-plan.entity';
import { UserPlanStatus } from '@modules/subscription/enum/user-plan-status.enum';
import { UserPlanRepository } from '@modules/subscription/repository/user-plan.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserPlanService {
  constructor(private readonly userPlanRepository: UserPlanRepository) {}

  async paySubscriptionPlan(userId: Uuid, subscriptionId: Uuid) {
    const userPlan = new UserPlanEntity({
      subscriptionPlanId: subscriptionId,
      userId: userId,
      userPlanStatus: UserPlanStatus.WAITING,
      code: await this.generatePaymentCode(),
    });

    await this.userPlanRepository.save(userPlan);

    return userPlan.toDto(UserPlanResDto);
  }

  private async generatePaymentCode() {
    const userPlan = await this.userPlanRepository.findLatestCodeUserPlan();
    let paymentCode = 'QUIZZFLY HD';
    const regex = /(\d+)$/;

    if (userPlan !== null) {
      const match = RegExp(regex).exec(userPlan.code);
      const currentNumber = parseInt(match[1], 10);
      paymentCode += currentNumber + 1;
    } else {
      paymentCode += '1';
    }

    return paymentCode;
  }
}
