import { Uuid } from '@common/types/common.type';
import { UpdateUserInfoDto } from '@modules/user/dto/request/update-user-info.req.dto';
import { UserInfoEntity } from '@modules/user/entities/user-info.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class UserInfoRepository extends Repository<UserInfoEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(UserInfoEntity, dataSource.createEntityManager());
  }

  async updateUserInfo(userId: Uuid, dto: UpdateUserInfoDto) {
    return this.createQueryBuilder('user_info')
      .update()
      .set(dto)
      .where('user_id = :userId', { userId })
      .execute();
  }
}
