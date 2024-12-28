import { Uuid } from '@common/types/common.type';
import { GOOGLE_URL } from '@core/constants/app.constant';
import { ROLE } from '@core/constants/entity.enum';
import { ErrorCode } from '@core/constants/error-code/error-code.constant';
import { TOKEN_TYPE } from '@core/constants/token-type.enum';
import { ICurrentUser } from '@core/interfaces';
import { JwtUtil } from '@core/utils/jwt.util';
import { Optional } from '@core/utils/optional';
import { hashPassword, verifyPassword } from '@core/utils/password.util';
import { MailService } from '@libs/mail/mail.service';
import { AuthResetPasswordDto } from '@modules/auth/dto/request/auth-reset-password.dto';
import { EmailDto } from '@modules/auth/dto/request/email.dto';
import { LoginWithGoogleReqDto } from '@modules/auth/dto/request/login-with-google.req.dto';
import { JwtPayloadType } from '@modules/auth/types/jwt-payload.type';
import { preparePermissionPayload } from '@modules/permission/helpers';
import { SessionEntity } from '@modules/session/entities/session.entity';
import { SessionService } from '@modules/session/session.service';
import { UserEntity } from '@modules/user/entities/user.entity';
import { UserService } from '@modules/user/user.service';
import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { plainToInstance } from 'class-transformer';
import crypto from 'crypto';
import { firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { LoginReqDto } from './dto/request/login.req.dto';
import { RefreshReqDto } from './dto/request/refresh.req.dto';
import { RegisterReqDto } from './dto/request/register.req.dto';
import { LoginResDto } from './dto/response/login.res.dto';
import { RefreshResDto } from './dto/response/refresh.res.dto';
import { RegisterResDto } from './dto/response/register.res.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtUtil: JwtUtil,
    private readonly mailService: MailService,
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
    private readonly httpService: HttpService,
  ) {}

  async signIn(
    dto: LoginReqDto,
    forAdmin: boolean = false,
  ): Promise<LoginResDto> {
    const { email, password } = dto;
    const user = Optional.of(
      await this.userService.findOneByCondition({ email }),
    )
      .throwIfNullable(new NotFoundException(ErrorCode.ACCOUNT_NOT_REGISTER))
      .get() as UserEntity;

    if (forAdmin && user.role.name !== ROLE.ADMIN) {
      throw new UnauthorizedException(ErrorCode.ACCESS_DENIED);
    }

    if (!user.isActive || !user.isConfirmed) {
      throw new BadRequestException(ErrorCode.ACCOUNT_NOT_ACTIVATED);
    }

    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(ErrorCode.INVALID_CREDENTIALS);
    }

    return this.createToken(user);
  }

  async loginWithGoogle(dto: LoginWithGoogleReqDto) {
    const googleResponse = await firstValueFrom(
      this.httpService
        .get(GOOGLE_URL.concat(dto.accessToken))
        .pipe(map((response) => response.data)),
    );
    const user = await this.userService.findOneByCondition({
      email: googleResponse.email,
    });
    if (user !== null) {
      return this.createToken(user);
    } else {
      const newUser = await this.userService.createUserWithGoogle(
        googleResponse.email,
        googleResponse.id,
        googleResponse.name,
        googleResponse.picture,
      );
      return this.createToken(newUser);
    }
  }

  async register(dto: RegisterReqDto): Promise<RegisterResDto> {
    const { email, password, name } = dto;
    Optional.of(
      await this.userService.findOneByCondition({ email }),
    ).throwIfPresent(new BadRequestException(ErrorCode.EMAIL_EXISTS));

    const user = await this.userService.create({
      email,
      password,
      name,
    });

    const token = await this.jwtUtil.createVerificationToken({ id: user.id });

    await this.mailService.sendEmailVerification(email, token);

    return plainToInstance(RegisterResDto, {
      userId: user.id,
    });
  }

  async logout(sessionId: Uuid | string): Promise<void> {
    Optional.of(
      await this.sessionService.findById(sessionId as Uuid),
    ).throwIfNotPresent(new UnauthorizedException(ErrorCode.UNAUTHORIZED));
    await this.sessionService.deleteById(sessionId);
  }

  async refreshToken(
    dto: RefreshReqDto,
    forAdmin: boolean = false,
  ): Promise<RefreshResDto> {
    const { sessionId, hash } = this.jwtUtil.verifyRefreshToken(
      dto.refreshToken,
    );
    const session = await this.sessionService.findById(sessionId);
    if (!session || session.hash !== hash) {
      throw new UnauthorizedException(ErrorCode.REFRESH_TOKEN_INVALID);
    }

    const user = await this.userService.findOneByCondition({
      id: session.userId,
    });
    if (forAdmin && user.role.name !== ROLE.ADMIN) {
      throw new UnauthorizedException(ErrorCode.ACCESS_DENIED);
    }

    const newHash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');

    await this.sessionService.update(session.id, { hash: newHash });

    return this.jwtUtil.createToken({
      id: user.id,
      sessionId: session.id,
      hash: newHash,
      role: user.role.name,
      permissions: preparePermissionPayload(user.role.permissions),
    });
  }

  async verifyEmailToken(token: string, type: TOKEN_TYPE) {
    let payload: Omit<JwtPayloadType, 'role' | 'sessionId'>;
    if (type === TOKEN_TYPE.ACTIVATION) {
      payload = this.jwtUtil.verifyActivateAccountToken(token);
      const user = await this.userService.updateUser(payload.id as Uuid, {
        isConfirmed: true,
        isActive: true,
      });

      if (!user) {
        throw new BadRequestException(ErrorCode.ACCOUNT_NOT_REGISTER);
      }
    } else if (type === TOKEN_TYPE.FORGOT_PASSWORD) {
      payload = this.jwtUtil.verifyForgotPasswordToken(token);
    }
  }

  async resendEmailActivation(dto: EmailDto) {
    const user = await this.userService.findOneByCondition({
      email: dto.email,
    });
    if (!user) {
      throw new NotFoundException(ErrorCode.ACCOUNT_NOT_REGISTER);
    }

    if (user.isActive) {
      throw new BadRequestException(ErrorCode.ACCOUNT_ALREADY_ACTIVATED);
    }

    const token = await this.jwtUtil.createVerificationToken({ id: user.id });

    await this.mailService.sendEmailVerification(user.email, token);
  }

  async forgotPassword(dto: EmailDto) {
    const user = await this.userService.findOneByCondition({
      email: dto.email,
    });
    if (!user) {
      throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
    }

    const token = await this.jwtUtil.createForgotPasswordToken({ id: user.id });

    await this.mailService.forgotPassword(dto.email, token);
  }

  async resetPassword(dto: AuthResetPasswordDto) {
    const payload = this.jwtUtil.verifyForgotPasswordToken(dto.token);
    const user = await this.userService.findById(payload.id as Uuid);

    if (!user) {
      throw new BadRequestException(ErrorCode.TOKEN_INVALID);
    }

    await this.userService.updateUser(payload.id as Uuid, {
      password: await hashPassword(dto.password),
    });
  }

  async revokeTokens(user: ICurrentUser) {
    const session: SessionEntity = Optional.of(
      await this.sessionService.findById(user.sessionId as Uuid),
    )
      .throwIfNullable(new BadRequestException('Session not found'))
      .get();

    await this.sessionService.deleteByUserIdWithExclude({
      userId: user.id as Uuid,
      excludeSessionId: session.id,
    });
  }

  async createToken(user: UserEntity) {
    const hash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');

    const session = await this.sessionService.create({ hash, userId: user.id });

    const token = await this.jwtUtil.createToken({
      id: user.id,
      sessionId: session.id,
      hash,
      role: user.role.name,
      permissions: preparePermissionPayload(user.role.permissions),
    });

    return plainToInstance(LoginResDto, {
      userId: user.id,
      ...token,
    });
  }
}
