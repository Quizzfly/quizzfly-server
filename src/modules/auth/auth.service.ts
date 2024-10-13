import { Uuid } from '@common/types/common.type';
import { ROLE } from '@core/constants/entity.enum';
import { ErrorCode } from '@core/constants/error-code.constant';
import { TOKEN_TYPE } from '@core/constants/token-type.enum';
import { ValidationException } from '@core/exceptions/validation.exception';
import { JwtUtil } from '@core/utils/jwt.util';
import { Optional } from '@core/utils/optional';
import { hashPassword, verifyPassword } from '@core/utils/password.util';
import { MailService } from '@mail/mail.service';
import { AuthResetPasswordDto } from '@modules/auth/dto/request/auth-reset-password.dto';
import { EmailDto } from '@modules/auth/dto/request/email.dto';
import { JwtPayloadType } from '@modules/auth/types/jwt-payload.type';
import { SessionService } from '@modules/session/session.service';
import { UserService } from '@modules/user/user.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { plainToInstance } from 'class-transformer';
import crypto from 'crypto';
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
  ) {}

  async signIn(
    dto: LoginReqDto,
    forAdmin: boolean = false,
  ): Promise<LoginResDto> {
    const { email, password } = dto;
    const user = await this.userService.findOneByCondition({ email });
    if (!user) {
      throw new NotFoundException(ErrorCode.A012);
    }

    if (forAdmin && user.role !== ROLE.ADMIN) {
      throw new UnauthorizedException(ErrorCode.A005);
    }

    if (!user.isActive || !user.isConfirmed) {
      throw new BadRequestException(ErrorCode.A010);
    }

    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(ErrorCode.A001);
    }

    const hash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');

    const session = await this.sessionService.create({ hash, userId: user.id });

    const token = await this.jwtUtil.createToken({
      id: user.id,
      sessionId: session.id,
      hash,
      role: user.role,
    });

    return plainToInstance(LoginResDto, {
      userId: user.id,
      ...token,
    });
  }

  async register(dto: RegisterReqDto): Promise<RegisterResDto> {
    const { email, password, name } = dto;
    Optional.of(
      await this.userService.findOneByCondition({ email }),
    ).throwIfPresent(new ValidationException(ErrorCode.E003));

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
    ).throwIfNotPresent(new UnauthorizedException(ErrorCode.A002));
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
      throw new UnauthorizedException(ErrorCode.A006);
    }

    const user = await this.userService.findById(session.userId);
    if (forAdmin && user.role !== ROLE.ADMIN) {
      throw new UnauthorizedException(ErrorCode.A005);
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
      role: user.role,
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
        throw new BadRequestException(ErrorCode.A012);
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
      throw new NotFoundException(ErrorCode.A012);
    }

    if (user.isActive) {
      throw new BadRequestException(ErrorCode.A011);
    }

    const token = await this.jwtUtil.createVerificationToken({ id: user.id });

    await this.mailService.sendEmailVerification(user.email, token);
  }

  async forgotPassword(dto: EmailDto) {
    const user = await this.userService.findOneByCondition({
      email: dto.email,
    });
    if (!user) {
      throw new NotFoundException(ErrorCode.E002);
    }

    const token = await this.jwtUtil.createForgotPasswordToken({ id: user.id });

    await this.mailService.forgotPassword(dto.email, token);
  }

  async resetPassword(dto: AuthResetPasswordDto) {
    const payload = this.jwtUtil.verifyForgotPasswordToken(dto.token);
    const user = await this.userService.findById(payload.id as Uuid);

    if (!user) {
      throw new BadRequestException(ErrorCode.A004);
    }

    await this.userService.updateUser(payload.id as Uuid, {
      password: hashPassword(dto.password),
    });
  }
}
