import { OffsetPaginationDto } from '@common/dto/offset-pagination/offset-pagination.dto';
import { PageOptionsDto } from '@common/dto/offset-pagination/page-options.dto';
import { OffsetPaginatedDto } from '@common/dto/offset-pagination/paginated.dto';
import { Uuid } from '@common/types/common.type';
import { NotificationEvent } from '@modules/notification/socket/enums/notification-event.enum';
import { NotificationSocketGateway } from '@modules/notification/socket/notification-socket.gateway';
import { WebhookPaymentUpdateReqDto } from '@modules/subscription/dto/request/webhook-payment-update.req.dto';
import { UserPlanResDto } from '@modules/subscription/dto/response/user-plan.res.dto';
import { UserPlanEntity } from '@modules/subscription/entity/user-plan.entity';
import { UserPlanStatus } from '@modules/subscription/enum/user-plan-status.enum';
import { UsageResourceRepository } from '@modules/subscription/repository/usage-resource.repository';
import { UserPlanRepository } from '@modules/subscription/repository/user-plan.repository';
import { SubscriptionPlanService } from '@modules/subscription/service/subscription-plan.service';
import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UserPlanService {
  constructor(
    private readonly userPlanRepository: UserPlanRepository,
    private readonly usageResourceRepository: UsageResourceRepository,
    private readonly subscriptionPlanService: SubscriptionPlanService,
    private readonly notificationSocketGateway: NotificationSocketGateway,
  ) {}

  async paySubscriptionPlan(userId: Uuid, subscriptionId: Uuid) {
    const subscriptionPlan =
      await this.subscriptionPlanService.findById(subscriptionId);

    const userPlan = new UserPlanEntity({
      subscriptionPlanId: subscriptionId,
      userId: userId,
      userPlanStatus: UserPlanStatus.WAITING,
      code: await this.generatePaymentCode(),
      amount: subscriptionPlan.price,
    });

    await this.userPlanRepository.save(userPlan);

    return userPlan.toDto(UserPlanResDto);
  }

  async getMyUserPlan(userId: Uuid, filterOptions: PageOptionsDto) {
    const userPlans: Array<any> = await this.userPlanRepository.getMyUserPlan(
      userId,
      filterOptions,
    );

    const totalRecords = await this.userPlanRepository.countBy({
      userId: userId,
    });

    const meta = new OffsetPaginationDto(totalRecords, filterOptions);

    return new OffsetPaginatedDto(
      plainToInstance(UserPlanResDto, userPlans, {
        excludeExtraneousValues: true,
      }),
      meta,
    );
  }

  async getUserPlanByAdmin(filterOptions: PageOptionsDto) {
    const userPlans: Array<any> =
      await this.userPlanRepository.getUserPlanByAdmin(filterOptions);

    const totalRecords = await this.userPlanRepository.count();

    const meta = new OffsetPaginationDto(totalRecords, filterOptions);

    return new OffsetPaginatedDto(
      plainToInstance(UserPlanResDto, userPlans, {
        excludeExtraneousValues: true,
      }),
      meta,
    );
  }

  async webhookPaymentUpdate(dto: WebhookPaymentUpdateReqDto) {
    const code = await this.getCodeInDescription(dto.description);

    if (code !== null) {
      const userPlan = await this.userPlanRepository.findUserPlanByCode(code);

      if (userPlan !== null && dto.amount >= userPlan.subscriptionPlan.price) {
        userPlan.amount = dto.amount;
        userPlan.description = dto.description;
        userPlan.userPlanStatus = UserPlanStatus.SUCCESS;
        userPlan.paymentedAt = dto.transactionTime;

        const paymentedAt = new Date(dto.transactionTime);
        const expiredAt = new Date(paymentedAt);
        expiredAt.setMonth(
          expiredAt.getMonth() + userPlan.subscriptionPlan.duration,
        );

        const dataSaved = new Date(expiredAt.toISOString());

        userPlan.subscriptionExpiredAt = dataSaved;
        await this.userPlanRepository.save(userPlan);

        const response = userPlan.toDto(UserPlanResDto);

        this.notificationSocketGateway.pushNotificationToUser(
          userPlan.userId,
          response,
          NotificationEvent.PAYMENT_SUCCESS,
        );

        return response;
      }
    }
  }

  private async getCodeInDescription(
    description: string,
  ): Promise<string | null> {
    const regex = /QUIZZFLY HD\d+/;
    const match = RegExp(regex).exec(description);
    return match ? match[0] : null;
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
