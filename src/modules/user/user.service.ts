import { CommonFunction } from '@common/common.function';
import { PageOptionsDto } from '@common/dto/offset-pagination/page-options.dto';
import { Uuid } from '@common/types/common.type';
import { CacheKey } from '@core/constants/cache.constant';
import { ROLE } from '@core/constants/entity.enum';
import { ErrorCode } from '@core/constants/error-code/error-code.constant';
import { EventService } from '@core/events/event.service';
import { Optional } from '@core/utils/optional';
import { verifyPassword } from '@core/utils/password.util';
import { MailService } from '@libs/mail/mail.service';
import { CacheTTL } from '@libs/redis/utils/cache-ttl.utils';
import { CreateCacheKey } from '@libs/redis/utils/create-cache-key.utils';
import { GetRoleEvent } from '@modules/role/events/get-role.event';
import { SessionService } from '@modules/session/session.service';
import { AdminQueryUserReqDto } from '@modules/user/dto/request/admin-query-user.req.dto';
import { ChangePasswordReqDto } from '@modules/user/dto/request/change-password.req';
import { CreateUserDto } from '@modules/user/dto/request/create-user.req.dto';
import { UpdateUserInfoDto } from '@modules/user/dto/request/update-user-info.req.dto';
import { UserResDto } from '@modules/user/dto/response/user.res.dto';
import { UserInfoEntity } from '@modules/user/entities/user-info.entity';
import { UserEntity } from '@modules/user/entities/user.entity';
import { UserInfoRepository } from '@modules/user/repositories/user-info.repository';
import { UserRepository } from '@modules/user/repositories/user.repository';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { plainToInstance } from 'class-transformer';
import { FindOptionsWhere } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userInfoRepository: UserInfoRepository,
    private readonly mailService: MailService,
    private readonly sessionService: SessionService,
    private readonly eventService: EventService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(dto: CreateUserDto): Promise<UserEntity> {
    const { email, password, name } = dto;
    const newUser = new UserEntity({
      email,
      password,
      isConfirmed: false,
      isActive: false,
    });

    const role = await this.eventService.emitAsync(
      new GetRoleEvent({ name: ROLE.USER }),
    );

    if (role) {
      newUser.roleId = role.id;
      newUser.role = role;
    }
    const savedUser = await this.userRepository.save(newUser);

    const newUserInfo = new UserInfoEntity({
      username: email.split('@')[0],
      userId: savedUser.id,
      name,
    });

    await this.userInfoRepository.save(newUserInfo);

    return savedUser;
  }

  async createUserWithGoogle(
    email: string,
    password: string,
    name: string,
    avatar: string,
  ) {
    const newUser = new UserEntity({
      email,
      password,
      isConfirmed: true,
      isActive: true,
    });

    const role = await this.eventService.emitAsync(
      new GetRoleEvent({ name: ROLE.USER }),
    );

    if (role) {
      newUser.roleId = role.id;
      newUser.role = role;
    }
    const savedUser = await this.userRepository.save(newUser);

    const newUserInfo = new UserInfoEntity({
      username: email.split('@')[0],
      userId: savedUser.id,
      name,
      avatar,
    });
    await this.userInfoRepository.save(newUserInfo);
    return savedUser;
  }

  async findById(id: Uuid) {
    const user = await this.userRepository.findOneByOrFail({ id });
    return plainToInstance(UserResDto, user);
  }

  async findByUserId(id: Uuid, withDeleted: boolean = false) {
    return Optional.of(
      await this.userRepository.findOne({
        where: { id },
        relations: ['userInfo'],
        withDeleted,
      }),
    )
      .throwIfNotPresent(new NotFoundException(ErrorCode.USER_NOT_FOUND))
      .get() as UserEntity;
  }

  async getUserInfo(userId: Uuid) {
    const userInfo = await this.userRepository.getUserInfo(userId);
    return userInfo.toDto(UserResDto);
  }

  async updateUserInfo(userId: Uuid, dto: UpdateUserInfoDto) {
    await this.userInfoRepository.updateUserInfo(userId, dto);
    return this.getUserInfo(userId);
  }

  async updateUser(userId: Uuid, dto: Partial<UserEntity>) {
    await this.userRepository.update({ id: userId }, dto);
    return this.userRepository.findOne({ where: { id: userId } });
  }

  async findOneByCondition(condition: FindOptionsWhere<UserEntity>) {
    return this.userRepository.findOne({
      where: condition,
      relations: {
        role: {
          permissions: true,
        },
      },
    });
  }

  async changePassword(dto: ChangePasswordReqDto, userId: Uuid) {
    const user = await this.findByUserId(userId);
    if ((await verifyPassword(dto.old_password, user.password)) === false) {
      throw new BadRequestException(ErrorCode.OLD_PASSWORD_INCORRECT);
    }

    user.password = dto.new_password;
    await this.userRepository.save(user);
  }

  async requestDeleteAccount(userId: Uuid) {
    const isExistRequest = await this.cacheManager.get(
      CreateCacheKey(CacheKey.REQUEST_DELETE, userId),
    );
    if (isExistRequest) {
      throw new BadRequestException(ErrorCode.REQUEST_DELETE_ACCOUNT_INVALID);
    }
    const user = await this.findByUserId(userId);
    const code = await CommonFunction.generateCode(6);
    await this.cacheManager.set(
      CreateCacheKey(CacheKey.REQUEST_DELETE, userId),
      code,
      CacheTTL.minutes(5),
    );
    await this.mailService.requestDeleteAccount(user.email, code);
  }

  async verifyDeleteAccount(userId: Uuid, code: string) {
    const codeInRedis = await this.cacheManager.get(
      CreateCacheKey(CacheKey.REQUEST_DELETE, userId),
    );
    if (code !== codeInRedis || codeInRedis === null) {
      throw new BadRequestException(ErrorCode.CODE_INCORRECT);
    }
    const user = await this.findByUserId(userId);
    user.deletedAt = new Date();
    await this.userRepository.save(user);

    await this.cacheManager.del(
      CreateCacheKey(CacheKey.REQUEST_DELETE, userId),
    );
    await this.sessionService.deleteByUserId({ userId: user.id });
  }

  async getListUser(filter: AdminQueryUserReqDto) {
    return this.userRepository.getListUser(filter);
  }

  async getListUserByRole(roleId: Uuid, filterOptions: PageOptionsDto) {
    return this.userRepository.getRoleAndUserAssigned(roleId, filterOptions);
  }

  async deleteUser(userId: Uuid) {
    const user = await this.findByUserId(userId);
    if (user.deletedAt === null) {
      await this.userRepository.softDelete({ id: userId });
    }
  }

  async restoreUser(userId: Uuid) {
    const user = await this.findByUserId(userId, true);
    if (user.deletedAt !== null) {
      user.deletedAt = null;
      await this.userRepository.save(user);
    }
  }

  async isExistUserByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
      withDeleted: true,
    });

    if (user) {
      return true;
    } else {
      return false;
    }
  }
}
