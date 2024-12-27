import { Uuid } from '@common/types/common.type';
import { ActionList, ResourceList } from '@core/constants/app.constant';
import { ApiAuth } from '@core/decorators/http.decorators';
import { ValidateUuid } from '@core/decorators/validators/uuid-validator';
import { PermissionGuard } from '@core/guards/permission.guard';
import { AssignPermissionDto } from '@modules/role/dto/request/assign-permission.dto';
import { CreateRoleDto } from '@modules/role/dto/request/create-role.dto';
import { RoleFilterDto } from '@modules/role/dto/request/role-filter.dto';
import { UpdateRoleDto } from '@modules/role/dto/request/update-role.dto';
import { RoleResDto } from '@modules/role/dto/response/role.res.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { RoleService } from './role.service';

@Controller({ path: 'roles', version: '1' })
@ApiTags('Role APIs')
@UseGuards(PermissionGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiAuth({
    summary: 'Create role',
    statusCode: HttpStatus.CREATED,
    type: RoleResDto,
    permissions: [
      { resource: ResourceList.ROLE, actions: [ActionList.CREATE] },
    ],
  })
  @Post()
  createRole(@Body() dto: CreateRoleDto) {
    return this.roleService.createRole(dto);
  }

  @ApiAuth({
    summary: 'Get all role information',
    type: RoleResDto,
    isPaginated: true,
    paginationType: 'offset',
    permissions: [
      { resource: ResourceList.ROLE, actions: [ActionList.READ_ALL] },
    ],
  })
  @Get('')
  getAllRole(@Query() query: RoleFilterDto) {
    return this.roleService.findAllRole(query);
  }

  @ApiAuth({
    summary: 'Get role information and permissions',
    type: RoleResDto,
    permissions: [{ resource: ResourceList.ROLE, actions: [ActionList.READ] }],
  })
  @ApiParam({
    name: 'roleId',
    description: 'The UUID of the role',
    type: 'string',
  })
  @Get(':roleId/permissions')
  async getRoleAndPermission(@Param('roleId', ValidateUuid) roleId: Uuid) {
    const role = await this.roleService.findOneRole({ id: roleId });
    return plainToInstance(RoleResDto, role);
  }

  @ApiAuth({
    summary: 'Assign permissions for role',
    type: RoleResDto,
    permissions: [
      { resource: ResourceList.ROLE, actions: [ActionList.UPDATE] },
    ],
  })
  @ApiParam({
    name: 'roleId',
    description: 'The UUID of the role',
    type: 'string',
  })
  @Post(':roleId/permissions')
  assignPermissionsForRole(
    @Param('roleId', ValidateUuid) roleId: Uuid,
    @Body() body: AssignPermissionDto,
  ) {
    return this.roleService.assignPermissionsForRole(
      roleId,
      body.permission_ids,
    );
  }

  @ApiAuth({
    summary: 'Remove permissions for role',
    type: RoleResDto,
    permissions: [
      { resource: ResourceList.ROLE, actions: [ActionList.UPDATE] },
    ],
  })
  @ApiParam({
    name: 'roleId',
    description: 'The UUID of the role',
    type: 'string',
  })
  @Delete(':roleId/permissions')
  removePermissionsForRole(
    @Param('roleId', ValidateUuid) roleId: Uuid,
    @Body() body: AssignPermissionDto,
  ) {
    return this.roleService.removePermissionForRole(
      roleId,
      body.permission_ids,
    );
  }

  @ApiAuth({
    summary: 'Update role information',
    type: RoleResDto,
    permissions: [
      { resource: ResourceList.ROLE, actions: [ActionList.UPDATE] },
    ],
  })
  @ApiParam({
    name: 'roleId',
    description: 'The UUID of the role',
    type: 'string',
  })
  @Put(':roleId')
  updateRoleInformation(
    @Param('roleId', ValidateUuid) roleId: Uuid,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.roleService.updateRole(roleId, dto);
  }

  @ApiAuth({
    summary: 'Delete a role',
    statusCode: HttpStatus.NO_CONTENT,
    permissions: [
      { resource: ResourceList.ROLE, actions: [ActionList.DELETE] },
    ],
  })
  @ApiParam({
    name: 'roleId',
    description: 'The UUID of the role',
    type: 'string',
  })
  @Delete(':roleId')
  remove(@Param('roleId', ValidateUuid) roleId: Uuid) {
    return this.roleService.removeRole(roleId);
  }

  @ApiAuth({
    summary: 'Restore a role deleted',
    type: RoleResDto,
    permissions: [
      { resource: ResourceList.ROLE, actions: [ActionList.UPDATE] },
    ],
  })
  @ApiParam({
    name: 'roleId',
    description: 'The UUID of the role',
    type: 'string',
  })
  @Patch(':roleId')
  restore(@Param('roleId', ValidateUuid) roleId: Uuid) {
    return this.roleService.restoreRole(roleId);
  }
}
