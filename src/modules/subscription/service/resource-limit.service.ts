import { Uuid } from '@common/types/common.type';
import { ErrorCode } from '@core/constants/error-code/error-code.constant';
import { Optional } from '@core/utils/optional';
import { CreateResourceLimitReqDto } from '@modules/subscription/dto/request/create-resource-limit.req.dto';
import { ResourceLimitResDto } from '@modules/subscription/dto/response/resource-limit.res.dto';
import { ResourceLimitEntity } from '@modules/subscription/entity/resource-limit.entity';
import { ResourceLimitRepository } from '@modules/subscription/repository/resource-limit.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ResourceLimitService {
  constructor(
    private readonly resourceLimitRepository: ResourceLimitRepository,
  ) {}

  async createResourceLimit(
    subscriptionId: Uuid,
    dto: CreateResourceLimitReqDto,
  ) {
    const resourceLimit = new ResourceLimitEntity({
      ...dto,
      subscriptionPlanId: subscriptionId,
    });
    await this.resourceLimitRepository.save(resourceLimit);
    return resourceLimit.toDto(ResourceLimitResDto);
  }

  async findById(id: Uuid) {
    return Optional.of(
      await this.resourceLimitRepository.findOne({
        where: { id },
      }),
    )
      .throwIfNotPresent(
        new NotFoundException(ErrorCode.RESOURCE_LIMIT_NOT_FOUND),
      )
      .get();
  }

  async updateResourceLimit(id: Uuid, dto: CreateResourceLimitReqDto) {
    const resourceLimit = await this.findById(id);
    Object.assign(resourceLimit, dto);
    await this.resourceLimitRepository.save(resourceLimit);

    return resourceLimit.toDto(ResourceLimitResDto);
  }

  async deleteResourceLimit(id: Uuid) {
    const resourceLimit = await this.findById(id);
    await this.resourceLimitRepository.softDelete({ id: id });
  }

  async getListResourceLimit(subscriptionId: Uuid) {
    const resourceLimits = await this.resourceLimitRepository.findBy({
      subscriptionPlanId: subscriptionId,
    });

    return plainToInstance(ResourceLimitResDto, resourceLimits);
  }
}
