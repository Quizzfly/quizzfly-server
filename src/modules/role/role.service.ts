import { OffsetPaginationDto } from '@common/dto/offset-pagination/offset-pagination.dto';
import { PageOptionsDto } from '@common/dto/offset-pagination/page-options.dto';
import { OffsetPaginatedDto } from '@common/dto/offset-pagination/paginated.dto';
import { Uuid } from '@common/types/common.type';
import { ActionList, ResourceList } from '@core/constants/app.constant';
import { ErrorCode } from '@core/constants/error-code/error-code.constant';
import { isRoleCoreSystem } from '@core/helpers';
import { Optional } from '@core/utils/optional';
import { PermissionService } from '@modules/permission/permission.service';
import { CreateRoleDto } from '@modules/role/dto/request/create-role.dto';
import { RoleFilterDto } from '@modules/role/dto/request/role-filter.dto';
import { UpdateRoleDto } from '@modules/role/dto/request/update-role.dto';
import { RoleResDto } from '@modules/role/dto/response/role.res.dto';
import { RoleEntity } from '@modules/role/entities/role.entity';
import { RoleRepository } from '@modules/role/repositories/role.repository';
import { UserResDto } from '@modules/user/dto/response/user.res.dto';
import { UserService } from '@modules/user/user.service';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { plainToInstance } from 'class-transformer';
import { FindManyOptions, FindOptionsWhere, ILike, Not } from 'typeorm';

@Injectable()
export class RoleService {
  constructor(
    private readonly repository: RoleRepository,
    private readonly permissionsService: PermissionService,
    private readonly userService: UserService,
  ) {}

  async createRole(dto: CreateRoleDto) {
    Optional.of(await this.findRoleByName(dto.name)).throwIfExist(
      new ConflictException(ErrorCode.ROLE_NAME_EXIST),
    );

    const role = new RoleEntity({ ...dto, permissions: undefined });
    if (dto.permission_ids && dto.permission_ids.length > 0) {
      const permissions = await this.permissionsService.whereInIds(
        dto.permission_ids,
      );

      if (permissions.length !== dto.permission_ids.length) {
        throw new BadRequestException(ErrorCode.PERMISSION_INVALID);
      }
      role.permissions = permissions;
    }

    await this.repository.save(role);

    return plainToInstance(RoleResDto, role);
  }

  @OnEvent(`${ResourceList.ROLE}.${ActionList.READ}`)
  async findOneRole(filter: FindOptionsWhere<RoleEntity>) {
    return Optional.of(
      await this.repository.findOne({
        where: filter,
        relations: { permissions: true },
      }),
    )
      .throwIfNullable(new NotFoundException(ErrorCode.ROLE_NOT_FOUND))
      .get() as RoleEntity;
  }

  async findRoleByName(name: string, excludeId?: Uuid) {
    const condition: FindOptionsWhere<RoleEntity> = { name: ILike(name) };
    if (excludeId) {
      condition.id = Not(excludeId);
    }

    return this.repository.findOneBy(condition);
  }

  async getRoleAndUserAssigned(roleId: Uuid, filterOptions: PageOptionsDto) {
    return this.userService.getListUserByRole(roleId, filterOptions);
  }

  async findAllRole(filter: RoleFilterDto) {
    const searchCriteria = ['name', 'description'];
    const whereCondition = [];
    const findOptions: FindManyOptions = {};

    if (filter.keywords) {
      for (const key of searchCriteria) {
        whereCondition.push({
          [key]: ILike(`%${filter.keywords}%`),
        });
      }
    }
    findOptions.take = filter.limit;
    findOptions.skip = filter.page ? (filter.page - 1) * filter.limit : 0;
    findOptions.where = whereCondition;
    findOptions.order = { createdAt: filter.order };
    findOptions.relations = { permissions: true };
    findOptions.withDeleted = filter.includeDeleted;

    const [roles, totalRecords] =
      await this.repository.findAndCount(findOptions);

    const meta = new OffsetPaginationDto(totalRecords, filter);
    return new OffsetPaginatedDto(plainToInstance(RoleResDto, roles), meta);
  }

  async updateRole(roleId: Uuid, dto: UpdateRoleDto) {
    const { permission_ids } = dto;
    if (dto.name) {
      Optional.of(await this.findRoleByName(dto.name, roleId)).throwIfExist(
        new ConflictException(ErrorCode.ROLE_NAME_EXIST),
      );
    }

    const role = await this.findOneRole({ id: roleId });
    if (dto.name && isRoleCoreSystem(role.name)) {
      throw new ForbiddenException(ErrorCode.FORBIDDEN);
    }
    Object.assign(role, { ...dto, permission_ids: undefined });
    await this.repository.save(role);

    if (permission_ids && permission_ids.length > 0) {
      const permissions =
        await this.permissionsService.whereInIds(permission_ids);
      if (permissions.length !== permission_ids.length) {
        throw new BadRequestException(ErrorCode.PERMISSION_INVALID);
      }

      const currentPermissionIds = role.permissions.map(
        (permission) => permission.id,
      );

      const setPermissionIds = new Set(permission_ids);
      const removePermissionIds = currentPermissionIds.filter(
        (id) => !setPermissionIds.has(id),
      );

      const setCurrentPermissionIds = new Set(currentPermissionIds);
      const addPermissionIds = permission_ids.filter(
        (id) => !setCurrentPermissionIds.has(id),
      );

      await this.repository
        .createQueryBuilder()
        .relation(RoleEntity, 'permissions')
        .of(role)
        .addAndRemove(addPermissionIds, removePermissionIds);

      role.permissions = permissions;
    }

    return role;
  }

  async assignPermissionsForRole(roleId: Uuid, permissionIds: Uuid[]) {
    const role = await this.findOneRole({ id: roleId });
    if (!role.permissions) role.permissions = [];

    if (permissionIds && permissionIds.length > 0) {
      const isExist = this.checkPermissionsExistInRole(
        role,
        permissionIds,
        false,
      );

      if (isExist) {
        throw new ConflictException(
          ErrorCode.PERMISSION_ALREADY_EXISTS_IN_ROLE,
        );
      }

      const permissions =
        await this.permissionsService.whereInIds(permissionIds);
      if (permissions.length !== permissionIds.length) {
        throw new BadRequestException(ErrorCode.PERMISSION_INVALID);
      }

      await this.repository
        .createQueryBuilder()
        .relation(RoleEntity, 'permissions')
        .of(role.id)
        .add(permissions.map((permission) => permission.id));

      role.permissions = [...role.permissions, ...permissions];
    }

    return plainToInstance(RoleResDto, role);
  }

  async removePermissionForRole(roleId: Uuid, permissionIds: Uuid[]) {
    const role = await this.findOneRole({ id: roleId });

    if (permissionIds && permissionIds.length > 0) {
      const validAll = this.checkPermissionsExistInRole(
        role,
        permissionIds,
        true,
      );

      if (!validAll) {
        throw new BadRequestException(ErrorCode.PERMISSION_INVALID);
      }

      const permissions =
        await this.permissionsService.whereInIds(permissionIds);
      await this.repository
        .createQueryBuilder()
        .relation(RoleEntity, 'permissions')
        .of(role.id)
        .remove(permissions.map((permission) => permission.id));

      const setIds = new Set(permissionIds);
      role.permissions = role.permissions.filter(
        (permission) => !setIds.has(permission.id),
      );
    }

    return plainToInstance(RoleResDto, role);
  }

  async assignRoleForUser(roleId: Uuid, userId: Uuid) {
    const [role, user] = await Promise.all([
      this.findOneRole({ id: roleId }),
      this.userService.findByUserId(userId),
    ]);

    if (user.roleId !== roleId) {
      await this.userService.updateUser(userId, {
        roleId: roleId,
      });
      user.roleId = roleId;
    }

    if (!user.role) user.role = role;

    return plainToInstance(UserResDto, user, { excludeExtraneousValues: true });
  }

  checkPermissionsExistInRole(
    role: RoleEntity,
    permissionIds: Uuid[],
    validAll: boolean,
  ) {
    const setIds = new Set(role.permissions.map((permission) => permission.id));
    if (validAll) {
      return permissionIds.every((permissionId) => setIds.has(permissionId));
    }
    return permissionIds.some((permissionId) => setIds.has(permissionId));
  }

  async removeRole(roleId: Uuid) {
    const role = await this.findOneRole({ id: roleId });
    if (isRoleCoreSystem(role.name)) {
      throw new ForbiddenException(ErrorCode.FORBIDDEN);
    }
    await this.repository.softDelete({ id: roleId });
  }

  async restoreRole(roleId: Uuid) {
    const role = Optional.of(
      await this.repository.findOne({
        where: { id: roleId },
        withDeleted: true,
      }),
    )
      .throwIfNullable(new NotFoundException(ErrorCode.ROLE_NOT_FOUND))
      .get() as RoleEntity;

    role.deletedAt = null;
    return this.repository.save(role);
  }
}
