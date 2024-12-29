import { PageOptionsDto } from '@common/dto/offset-pagination/page-options.dto';
import { Uuid } from '@common/types/common.type';
import { CurrentUser } from '@core/decorators/current-user.decorator';
import { ApiAuth, ApiPublic } from '@core/decorators/http.decorators';
import { ValidateUuid } from '@core/decorators/validators/uuid-validator';
import { WebhookPaymentUpdateReqDto } from '@modules/subscription/dto/request/webhook-payment-update.req.dto';
import { UserPlanService } from '@modules/subscription/service/user-plan.service';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { UserPlanResDto } from '../dto/response/user-plan.res.dto';

@ApiTags('User Plan APIs')
@Controller({
  version: '1',
})
export class UserPlanController {
  constructor(private readonly userPlanService: UserPlanService) {}

  @ApiAuth({
    summary: 'Pay a subscription plan',
    type: UserPlanResDto,
  })
  @ApiParam({
    name: 'subscriptionId',
    description: 'The UUID of the subscription',
    type: 'string',
  })
  @Post('subscription/:subscriptionId/payment')
  async paySubscriptionPlan(
    @CurrentUser('id') userId: Uuid,
    @Param('subscriptionId', ValidateUuid) subscriptionId: Uuid,
  ) {
    return await this.userPlanService.paySubscriptionPlan(
      userId,
      subscriptionId,
    );
  }

  @ApiAuth({
    summary: 'Get my subscription plan',
    type: UserPlanResDto,
    isPaginated: true,
    paginationType: 'offset',
  })
  @Get('user-plans')
  async getMyUserPlan(
    @CurrentUser('id') userId: Uuid,
    @Query() filterOptions: PageOptionsDto,
  ) {
    return await this.userPlanService.getMyUserPlan(userId, filterOptions);
  }

  @ApiPublic({
    summary: 'Webhook payment',
    type: UserPlanResDto,
  })
  @Post('webhook/payment-updates')
  async webhookPayment(@Body() dto: WebhookPaymentUpdateReqDto) {
    return await this.userPlanService.webhookPaymentUpdate(dto);
  }
}
