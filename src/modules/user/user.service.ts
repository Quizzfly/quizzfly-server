import { Uuid } from '@common/types/common.type';
import { ErrorCode } from '@core/constants/error-code.constant';
import { Optional } from '@core/utils/optional';
import { verifyPassword } from '@core/utils/password.util';
import { ChangePasswordReqDto } from '@modules/user/dto/request/change-password.req';
import { CreateUserDto } from '@modules/user/dto/request/create-user.req.dto';
import { UpdateUserInfoDto } from '@modules/user/dto/request/update-user-info.req.dto';
import { UserResDto } from '@modules/user/dto/response/user.res.dto';
import { UserInfoEntity } from '@modules/user/entities/user-info.entity';
import { UserEntity } from '@modules/user/entities/user.entity';
import { UserInfoRepository } from '@modules/user/repositories/user-info.repository';
import { UserRepository } from '@modules/user/repositories/user.repository';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly userInfoRepository: UserInfoRepository,
  ) {}

  async create(dto: CreateUserDto): Promise<UserEntity> {
    const { email, password, name } = dto;
    const newUser = new UserEntity({
      email,
      password,
      isConfirmed: false,
      isActive: false,
    });
    const savedUser = await this.userRepository.save(newUser);

    const newUserInfo = new UserInfoEntity({
      username: email.split('@')[0],
      userId: savedUser.id,
      name,
    });

    await this.userInfoRepository.save(newUserInfo);

    return savedUser;
  }

  async findById(id: Uuid) {
    const user = await this.userRepository.findOneByOrFail({ id });
    return plainToInstance(UserResDto, user);
  }

  async findByUserId(id: Uuid) {
    return Optional.of(
      await this.userRepository.findOne({
        where: { id },
        relations: ['userInfo'],
      }),
    )
      .throwIfNotPresent(new NotFoundException(ErrorCode.E002))
      .get();
  }

  async getUserInfo(userId: Uuid) {
    const userInfo = await this.userRepository.getUserInfo(userId);
    return userInfo.toDto(UserResDto);
  }

  async updateUserInfo(userId: Uuid, dto: UpdateUserInfoDto) {
    await this.userInfoRepository.updateUserInfo(userId, dto);
    return this.getUserInfo(userId);
  }

  async updateUser(userId: Uuid, dto: any) {
    await this.userRepository.update({ id: userId }, dto);
    return this.userRepository.findOne({ where: { id: userId } });
  }

  async findOneByCondition(
    condition: Pick<UserEntity, 'email' | 'isConfirmed' | 'isActive'>,
  ) {
    return this.userRepository.findOne({ where: condition });
  }

  async remove(id: Uuid) {
    await this.userRepository.findOneByOrFail({ id });
    await this.userRepository.softDelete(id);
  }

  async getUserInfoByCondition(condition: any) {
    return this.userRepository.findOne({ where: condition });
  }

  async changePassword(dto: ChangePasswordReqDto, userId: Uuid) {
    const user = await this.findByUserId(userId);
    if ((await verifyPassword(dto.old_password, user.password)) === false) {
      throw new BadRequestException(ErrorCode.A013);
    }

    user.password = dto.new_password;
    await this.userRepository.save(user);
  }
}
