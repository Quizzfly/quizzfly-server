import { Uuid } from '@common/types/common.type';
import { ROLE } from '@core/constants/entity.enum';
import { ApiAuth, ApiPublic } from '@core/decorators/http.decorators';
import { ValidateUuid } from '@core/decorators/validators/uuid-validator';
import { RolesGuard } from '@core/guards/role.guard';
import { CreateSubscriptionPlanReqDto } from '@modules/subscription/dto/request/create-subscription-plan.req.dto';
import { SubscriptionPlanService } from '@modules/subscription/service/subscription-plan.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { SubscriptionPlanResDto } from '../dto/response/subscription-plan.res.dto';

@ApiTags('Subscription Plan APIs')
@Controller({
  path: '/subscriptions',
  version: '1',
})
export class SubscriptionPlanController {
  constructor(
    private readonly subscriptionPlanService: SubscriptionPlanService,
  ) {}

  @ApiAuth({
    summary: 'Create subscription plan',
    roles: [ROLE.ADMIN],
    type: SubscriptionPlanResDto,
  })
  @UseGuards(RolesGuard)
  @Post()
  async createSubscriptionPlan(@Body() dto: CreateSubscriptionPlanReqDto) {
    return await this.subscriptionPlanService.createSubscriptionPlan(dto);
  }

  @ApiAuth({
    summary: 'Update subscription plan',
    roles: [ROLE.ADMIN],
    type: SubscriptionPlanResDto,
  })
  @ApiParam({
    name: 'subscriptionId',
    description: 'The UUID of the subscription',
    type: 'string',
  })
  @UseGuards(RolesGuard)
  @Put(':subscriptionId')
  async updateSubscriptionPlan(
    @Body() dto: CreateSubscriptionPlanReqDto,
    @Param('subscriptionId', ValidateUuid) subscriptionId: Uuid,
  ) {
    return await this.subscriptionPlanService.updateSubscriptionPlan(
      subscriptionId,
      dto,
    );
  }

  @ApiAuth({
    summary: 'Delete subscription plan',
    roles: [ROLE.ADMIN],
    type: SubscriptionPlanResDto,
  })
  @ApiParam({
    name: 'subscriptionId',
    description: 'The UUID of the subscription',
    type: 'string',
  })
  @UseGuards(RolesGuard)
  @Delete(':subscriptionId')
  async deleteSubscriptionPlan(
    @Param('subscriptionId', ValidateUuid) subscriptionId: Uuid,
  ) {
    return await this.subscriptionPlanService.deleteSubscriptionPlan(
      subscriptionId,
    );
  }

  @ApiPublic({
    summary: 'Get list subscription plan',
    type: SubscriptionPlanResDto,
  })
  @Get()
  async getListSubscriptionPlan() {
    return await this.subscriptionPlanService.getListSubscriptionPlan();
  }
}
