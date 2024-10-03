import { Uuid } from '@common/types/common.type';
import { ErrorCode } from '@core/constants/error-code.constant';
import { ValidationException } from '@core/exceptions/validation.exception';
import { Optional } from '@core/utils/optional';
import { CreateUserReqDto } from '@modules/user/dto/request/create-user.req.dto';
import { UserInfoEntity } from '@modules/user/entities/user-info.entity';
import { UserEntity } from '@modules/user/entities/user.entity';
import { UserInfoRepository } from '@modules/user/repositories/user-info.repository';
import { UserRepository } from '@modules/user/repositories/user.repository';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly userInfoRepository: UserInfoRepository,
  ) {}

  async create(dto: CreateUserReqDto): Promise<UserEntity> {
    const { email, password } = dto;
    Optional.of(
      await this.userRepository.findOne({
        where: { email },
      }),
    ).throwIfPresent(new ValidationException(ErrorCode.E001));

    const newUser = new UserEntity({
      email,
      password,
    });
    const savedUser = await this.userRepository.save(newUser);

    const newUserInfo = new UserInfoEntity({
      username: dto.email.split('@')[0],
      userId: savedUser.id,
      name: dto.name,
    });

    await this.userInfoRepository.save(newUserInfo);

    return savedUser;
  }

  async findById(id: Uuid) {
    const user = await this.userRepository.findOneByOrFail({ id });
    return user;
  }

  async findOneByCondition(condition: any) {
    return this.userRepository.findOne({ where: condition });
  }

  async remove(id: Uuid) {
    await this.userRepository.findOneByOrFail({ id });
    await this.userRepository.softDelete(id);
  }

  async getUserInfoByCondition(condition: any) {
    return this.userRepository.findOne({ where: condition });
  }
}
