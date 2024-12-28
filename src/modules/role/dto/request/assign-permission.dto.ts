import { CreateRoleDto } from '@modules/role/dto/request/create-role.dto';
import { PickType } from '@nestjs/swagger';

export class AssignPermissionDto extends PickType(CreateRoleDto, [
  'permission_ids',
]) {}
