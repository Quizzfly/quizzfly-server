import { Uuid } from '@common/types/common.type';
import { ErrorCode } from '@core/constants/error-code.constant';
import { ValidationException } from '@core/exceptions/validation.exception';
import { Optional } from '@core/utils/optional';
import { verifyPassword } from '@core/utils/password.util';
import { MailService } from '@mail/mail.service';
import { SessionEntity } from '@modules/session/entities/session.entity';
import { SessionService } from '@modules/session/session.service';
import { UserService } from '@modules/user/user.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { JwtUtil } from '@shared/services/jwt.util';
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

  async signIn(dto: LoginReqDto): Promise<LoginResDto> {
    const { email, password } = dto;
    const user = await this.userService.findOneByCondition({ email });

    const isPasswordValid =
      user && (await verifyPassword(password, user.password));

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
    Optional.of(
      await this.userService.findOneByCondition({ email: dto.email }),
    ).throwIfPresent(new ValidationException(ErrorCode.E003));

    const user = await this.userService.create({
      email: dto.email,
      password: dto.password,
    });

    return plainToInstance(RegisterResDto, {
      userId: user.id,
    });
  }

  async logout(sessionId: Uuid | string): Promise<void> {
    await this.sessionService.deleteById(sessionId);
  }

  async refreshToken(dto: RefreshReqDto): Promise<RefreshResDto> {
    const { sessionId, hash } = this.jwtUtil.verifyRefreshToken(
      dto.refreshToken,
    );
    const session = await SessionEntity.findOneBy({ id: sessionId });

    if (!session || session.hash !== hash) {
      throw new UnauthorizedException(ErrorCode.A006);
    }

    const user = await this.userService.findById(session.userId);

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
}
