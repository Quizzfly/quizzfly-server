import { AllConfigType } from '@config/config.type';
import { ErrorCode } from '@core/constants/error-code.constant';
import { JwtPayloadType } from '@modules/auth/types/jwt-payload.type';
import { JwtRefreshPayloadType } from '@modules/auth/types/jwt-refresh-payload.type';
import { Token } from '@modules/auth/types/token.type';
import { Global, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import ms from 'ms';

@Global()
export class JwtUtil {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly jwtService: JwtService,
  ) {}

  async verifyAccessToken(token: string): Promise<JwtPayloadType> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.getOrThrow('auth.secret', { infer: true }),
      });
      return payload;
    } catch {
      throw new UnauthorizedException(ErrorCode.A004);
    }

    // Force logout if the session is in the blacklist
  }

  verifyRefreshToken(token: string): JwtRefreshPayloadType {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.getOrThrow('auth.refreshSecret', {
          infer: true,
        }),
      });
    } catch {
      throw new UnauthorizedException(ErrorCode.A006);
    }
  }

  async createToken(data: {
    id: string;
    sessionId: string;
    hash: string;
    role: string;
  }): Promise<Token> {
    const tokenExpiresIn = this.configService.getOrThrow('auth.expires', {
      infer: true,
    });
    const tokenExpires = Date.now() + ms(tokenExpiresIn);

    const [accessToken, refreshToken] = await Promise.all([
      await this.jwtService.signAsync(
        {
          id: data.id,
          role: data.role,
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
