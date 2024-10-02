import { AllConfigType } from '@config/config.type';
import { ErrorCode } from '@core/constants/error-code.constant';
import { Optional } from '@core/utils/optional';
import { verifyPassword } from '@core/utils/password.util';
import { MailService } from '@mail/mail.service';
import { JwtPayloadType } from '@modules/auth/types/jwt-payload.type';
import { JwtRefreshPayloadType } from '@modules/auth/types/jwt-refresh-payload.type';
import { Token } from '@modules/auth/types/token.type';
import { SessionEntity } from '@modules/user/entities/session.entity';
import { UserEntity } from '@modules/user/entities/user.entity';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import crypto from 'crypto';
import ms from 'ms';
import { Repository } from 'typeorm';
import { LoginReqDto } from './dto/request/login.req.dto';
import { RefreshReqDto } from './dto/request/refresh.req.dto';
import { RegisterReqDto } from './dto/request/register.req.dto';
import { LoginResDto } from './dto/response/login.res.dto';
import { RefreshResDto } from './dto/response/refresh.res.dto';
import { RegisterResDto } from './dto/response/register.res.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  /**
   * Sign in user
   * @param dto LoginReqDto
   * @returns LoginResDto
   */
  async signIn(dto: LoginReqDto): Promise<LoginResDto> {
    const { email, password } = dto;
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password'],
    });

    const isPasswordValid =
      user && (await verifyPassword(password, user.password));

    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }

    const hash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');

    const session = new SessionEntity({
      hash,
      userId: user.id,
    });
    await session.save();

    const token = await this.createToken({
      id: user.id,
      sessionId: session.id,
      hash,
    });

    return plainToInstance(LoginResDto, {
      userId: user.id,
      ...token,
    });
  }

  async register(dto: RegisterReqDto): Promise<RegisterResDto> {
    // Check if the user already exists
    Optional.of(
      await this.userRepository.exists({ where: { email: dto.email } }),
    ).throwIfExist(new ConflictException(ErrorCode.E001));

    // Register user
    const user = new UserEntity({
      email: dto.email,
      password: dto.password,
    });

    await user.save();

    return plainToInstance(RegisterResDto, {
      userId: user.id,
    });
  }

  async logout(sessionId: string): Promise<void> {
    await SessionEntity.delete(sessionId);
  }

  async refreshToken(dto: RefreshReqDto): Promise<RefreshResDto> {
    const { sessionId, hash } = this.verifyRefreshToken(dto.refreshToken);
    const session = await SessionEntity.findOneBy({ id: sessionId });

    if (!session || session.hash !== hash) {
      throw new UnauthorizedException();
    }

    const user = await this.userRepository.findOneOrFail({
      where: { id: session.userId },
      select: ['id'],
    });

    const newHash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');

    await SessionEntity.update(session.id, { hash: newHash });

    return await this.createToken({
      id: user.id,
      sessionId: session.id,
      hash: newHash,
    });
  }

  verifyAccessToken(token: string): JwtPayloadType {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.getOrThrow('auth.secret', { infer: true }),
      });

      return payload;
    } catch {
      throw new UnauthorizedException();
    }
  }

  private verifyRefreshToken(token: string): JwtRefreshPayloadType {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.getOrThrow('auth.refreshSecret', {
          infer: true,
        }),
      });
    } catch {
      throw new UnauthorizedException();
    }
  }

  private async createToken(data: {
    id: string;
    sessionId: string;
    hash: string;
  }): Promise<Token> {
    const tokenExpiresIn = this.configService.getOrThrow('auth.expires', {
      infer: true,
    });
    const tokenExpires = Date.now() + ms(tokenExpiresIn);

    const [accessToken, refreshToken] = await Promise.all([
      await this.jwtService.signAsync(
        {
          id: data.id,
          role: '', // TODO: add role
          sessionId: data.sessionId,
        },
        {
          secret: this.configService.getOrThrow('auth.secret', { infer: true }),
          expiresIn: tokenExpiresIn,
        },
      ),
      await this.jwtService.signAsync(
        {
          sessionId: data.sessionId,
          hash: data.hash,
        },
        {
          secret: this.configService.getOrThrow('auth.refreshSecret', {
            infer: true,
          }),
          expiresIn: this.configService.getOrThrow('auth.refreshExpires', {
            infer: true,
          }),
        },
      ),
    ]);
    return {
      accessToken,
      refreshToken,
      tokenExpires,
    } as Token;
  }
}
