import { CreateRoleDto } from '@modules/role/dto/request/create-role.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
