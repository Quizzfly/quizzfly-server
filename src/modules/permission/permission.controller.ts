import { ActionList, ResourceList } from '@core/constants/app.constant';
import { ApiAuth } from '@core/decorators/http.decorators';
import { PermissionGuard } from '@core/guards/permission.guard';
import { PermissionFilterDto } from '@modules/permission/dto/request/permission-filter.dto';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PermissionService } from './permission.service';

@Controller({ path: 'permissions', version: '1' })
@ApiTags('Permission APIs')
@UseGuards(PermissionGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @ApiAuth({
    summary: 'Get all permission',
    permissions: [
      { resource: ResourceList.PERMISSION, actions: [ActionList.READ_ALL] },
    ],
  })
  @Get()
  getAllPermission(@Query() query: PermissionFilterDto) {
    return this.permissionService.getAllPermission(query);
  }

  @ApiAuth({
    summary: 'Get all permission and group by resource',
    permissions: [
      { resource: ResourceList.PERMISSION, actions: [ActionList.READ_ALL] },
    ],
  })
  @Get('group-resource')
  getPermissionGroupByResource() {
    return this.permissionService.getPermissionGroupByResource();
  }

  @ApiAuth({
    summary: 'Get all resource',
    permissions: [
      { resource: ResourceList.PERMISSION, actions: [ActionList.READ_ALL] },
    ],
  })
  @Get('resources')
  getAllResource() {
    return this.permissionService.getAllResource();
  }

  @ApiAuth({
    summary: 'Get all action',
    permissions: [
      { resource: ResourceList.PERMISSION, actions: [ActionList.READ_ALL] },
    ],
  })
  @Get('actions')
  getAllAction() {
    return this.permissionService.getAllAction();
  }
}
