import { UserEntity } from '@modules/user/entities/user.entity';
import { Repository } from 'typeorm';

export class UserRepository extends Repository<UserEntity> {}
