import { CreateSubscriptionPlanReqDto } from '@modules/subscription/dto/request/create-subscription-plan.req.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdateSubscriptionPlanReqDto extends OmitType(
  CreateSubscriptionPlanReqDto,
  ['resourceLimits'],
) {}
