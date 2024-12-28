import { Uuid } from '@common/types/common.type';
import { CurrentUser } from '@core/decorators/current-user.decorator';
import { ApiAuth } from '@core/decorators/http.decorators';
import { ValidateUuid } from '@core/decorators/validators/uuid-validator';
import { UserPlanService } from '@modules/subscription/service/user-plan.service';
import { Controller, Param, Post } from '@nestjs/common';
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
}
