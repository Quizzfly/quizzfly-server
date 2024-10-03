import { OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.req.dto';

export class UpdateUserReqDto extends OmitType(CreateUserDto, [
  'email',
  'password',
] as const) {}
