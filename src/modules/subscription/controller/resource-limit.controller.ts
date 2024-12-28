import { Uuid } from '@common/types/common.type';
import { ROLE } from '@core/constants/entity.enum';
import { ApiAuth, ApiPublic } from '@core/decorators/http.decorators';
import { ValidateUuid } from '@core/decorators/validators/uuid-validator';
import { RolesGuard } from '@core/guards/role.guard';
import { CreateResourceLimitReqDto } from '@modules/subscription/dto/request/create-resource-limit.req.dto';
import { ResourceLimitService } from '@modules/subscription/service/resource-limit.service';
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
import { ResourceLimitResDto } from '../dto/response/resource-limit.res.dto';

@ApiTags('Resource Limit APIs')
@Controller({
  path: '',
  version: '1',
})
export class ResourceLimitController {
  constructor(private readonly resourceLimitService: ResourceLimitService) {}

  @ApiAuth({
    summary: 'Create resource limit',
    roles: [ROLE.ADMIN],
    type: ResourceLimitResDto,
  })
  @ApiParam({
    name: 'subscriptionId',
    description: 'The UUID of the subscription',
    type: 'string',
  })
  @UseGuards(RolesGuard)
  @Post('subscriptions/:subscriptionId/resource-limits')
  async createResourceLimit(
    @Body() dto: CreateResourceLimitReqDto,
    @Param('subscriptionId', ValidateUuid) subscriptionId: Uuid,
  ) {
    return await this.resourceLimitService.createResourceLimit(
      subscriptionId,
      dto,
    );
  }

  @ApiAuth({
    summary: 'Update resource limit',
    roles: [ROLE.ADMIN],
    type: ResourceLimitResDto,
  })
  @ApiParam({
    name: 'resourceLimitId',
    description: 'The UUID of the resource limit',
    type: 'string',
  })
  @UseGuards(RolesGuard)
  @Put('resource-limits/:resourceLimitId')
  async updateResourceLimit(
    @Body() dto: CreateResourceLimitReqDto,
    @Param('resourceLimitId', ValidateUuid) resourceLimitId: Uuid,
  ) {
    return await this.resourceLimitService.updateResourceLimit(
      resourceLimitId,
      dto,
    );
  }

  @ApiAuth({
    summary: 'Delete resource limit',
    roles: [ROLE.ADMIN],
  })
  @ApiParam({
    name: 'resourceLimitId',
    description: 'The UUID of the resource limit',
    type: 'string',
  })
  @UseGuards(RolesGuard)
  @Delete('resource-limits/:resourceLimitId')
  async deleteResourceLimit(
    @Param('resourceLimitId', ValidateUuid) resourceLimitId: Uuid,
  ) {
    return await this.resourceLimitService.deleteResourceLimit(resourceLimitId);
  }

  @ApiPublic({
    summary: 'Get list resource limit',
    type: ResourceLimitResDto,
  })
  @ApiParam({
    name: 'subscriptionId',
    description: 'The UUID of the subscription plan',
    type: 'string',
  })
  @Get('subscriptions/:subscriptionId/resource-limits')
  async getListResourceLimit(
    @Param('subscriptionId', ValidateUuid) subscriptionId: Uuid,
  ) {
    return await this.resourceLimitService.getListResourceLimit(subscriptionId);
  }
}
