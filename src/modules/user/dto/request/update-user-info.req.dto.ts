import { CreateUserInfoDto } from '@modules/user/dto/request/create-user-info.req.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdateUserInfoDto extends OmitType(CreateUserInfoDto, [
  'username',
]) {}
