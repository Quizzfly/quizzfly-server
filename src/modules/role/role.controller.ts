import { Uuid } from '@common/types/common.type';
import { ActionList, ResourceList } from '@core/constants/app.constant';
import { ApiAuth } from '@core/decorators/http.decorators';
import { ValidateUuid } from '@core/decorators/validators/uuid-validator';
import { PermissionGuard } from '@core/guards/permission.guard';
import { CreateRoleDto } from '@modules/role/dto/request/create-role.dto';
import { RoleFilterDto } from '@modules/role/dto/request/role-filter.dto';
import { UpdateRoleDto } from '@modules/role/dto/request/update-role.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { RoleService } from './role.service';

@Controller({ path: 'roles', version: '1' })
@ApiTags('Role APIs')
@UseGuards(PermissionGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiAuth({
    summary: 'Create role',
    statusCode: HttpStatus.CREATED,
    permissions: [
      { resource: ResourceList.ROLE, actions: [ActionList.CREATE] },
    ],
  })
  @Post()
  createRole(@Body() dto: CreateRoleDto) {}

  @ApiAuth({
    summary: 'Get all role information',
    permissions: [
      { resource: ResourceList.ROLE, actions: [ActionList.READ_ALL] },
    ],
  })
  @Get('')
  getAllRole(@Query() query: RoleFilterDto) {
    return this.roleService.findAllRole(query);
  }

  @ApiAuth({
    summary: 'Get role information',
    permissions: [{ resource: ResourceList.ROLE, actions: [ActionList.READ] }],
  })
  @ApiParam({
    name: 'roleId',
    description: 'The UUID of the role',
    type: 'string',
  })
  @Get(':roleId')
  getRoleInformation(@Param('roleId', ValidateUuid) roleId: Uuid) {}

  @ApiAuth({
    summary: 'Get role information and permissions',
    permissions: [{ resource: ResourceList.ROLE, actions: [ActionList.READ] }],
  })
  @ApiParam({
    name: 'roleId',
    description: 'The UUID of the role',
    type: 'string',
  })
  @Get(':roleId/permissions')
  getRoleAndPermission(@Param('roleId', ValidateUuid) roleId: Uuid) {}

  @ApiAuth({
    summary: 'Assign permissions for role',
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
  assignPermissionsForRole(@Param('roleId', ValidateUuid) roleId: Uuid) {}

  @ApiAuth({
    summary: 'Remove permissions for role',
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
  removePermissionsForRole(@Param('roleId', ValidateUuid) roleId: Uuid) {}

  @ApiAuth({
    summary: 'Update role information',
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
  ) {}

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
  remove(@Param('roleId', ValidateUuid) roleId: Uuid) {}
}
