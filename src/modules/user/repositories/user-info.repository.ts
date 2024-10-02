import { UserInfoEntity } from '@modules/user/entities/user-info.entity';
import { Repository } from 'typeorm';

export class UserInfoRepository extends Repository<UserInfoEntity> {}
