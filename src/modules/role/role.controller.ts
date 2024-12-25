import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RoleService } from './role.service';

@Controller({ path: 'roles', version: '1' })
@ApiTags('Role APIs')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}
}
