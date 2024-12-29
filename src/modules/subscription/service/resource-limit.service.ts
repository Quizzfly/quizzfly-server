import { Uuid } from '@common/types/common.type';
import { ErrorCode } from '@core/constants/error-code/error-code.constant';
import { Optional } from '@core/utils/optional';
import { CreateResourceLimitReqDto } from '@modules/subscription/dto/request/create-resource-limit.req.dto';
import { ResourceLimitResDto } from '@modules/subscription/dto/response/resource-limit.res.dto';
import { ResourceLimitEntity } from '@modules/subscription/entity/resource-limit.entity';
import { ResourceLimitRepository } from '@modules/subscription/repository/resource-limit.repository';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { FindOptionsWhere, Not } from 'typeorm';

@Injectable()
export class ResourceLimitService {
  constructor(
    private readonly resourceLimitRepository: ResourceLimitRepository,
  ) {}

  async createResourceLimit(
    subscriptionId: Uuid,
    dto: CreateResourceLimitReqDto,
  ) {
    Optional.of(
      await this.findOneByCondition({
        subscriptionPlanId: subscriptionId,
        resourceType: dto.resourceType,
      }),
    ).throwIfExist(
      new ConflictException(ErrorCode.RESOURCE_LIMIT_ALREADY_EXISTS),
    );

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
      .get() as ResourceLimitEntity;
  }

  async findOneByCondition(findOptions: FindOptionsWhere<ResourceLimitEntity>) {
    return this.resourceLimitRepository.findOneBy(findOptions);
  }

  async storeMultipleResourceLimit(
    subscriptionPlanId: Uuid,
    items: CreateResourceLimitReqDto[],
  ) {
    const entities = items.map((item) => {
      return { ...item, subscriptionPlanId } as ResourceLimitEntity;
    });

    await this.resourceLimitRepository
      .createQueryBuilder()
      .insert()
      .into(ResourceLimitEntity)
      .values(entities)
      .execute();

    return entities;
  }

  async updateResourceLimit(id: Uuid, dto: CreateResourceLimitReqDto) {
    const resourceLimit = await this.findById(id);

    if (dto.resourceType) {
      Optional.of(
        await this.findOneByCondition({
          subscriptionPlanId: resourceLimit.subscriptionPlanId,
          resourceType: Not(dto.resourceType),
        }),
      ).throwIfExist(
        new ConflictException(ErrorCode.RESOURCE_LIMIT_ALREADY_EXISTS),
      );
    }
    Object.assign(resourceLimit, dto);
    await this.resourceLimitRepository.save(resourceLimit);

    return resourceLimit.toDto(ResourceLimitResDto);
  }

  async deleteResourceLimit(id: Uuid) {
    await this.findById(id);
    await this.resourceLimitRepository.softDelete({ id: id });
  }

  async getListResourceLimitBySubscriptionId(subscriptionId: Uuid) {
    const resourceLimits = await this.resourceLimitRepository.findBy({
      subscriptionPlanId: subscriptionId,
    });

    return plainToInstance(ResourceLimitResDto, resourceLimits);
  }
}
