import { AllConfigType } from '@config/config.type';
import { ErrorCode } from '@core/constants/error-code/error-code.constant';
import { JwtPayloadType } from '@modules/auth/types/jwt-payload.type';
import { JwtRefreshPayloadType } from '@modules/auth/types/jwt-refresh-payload.type';
import { Token } from '@modules/auth/types/token.type';
import { Global, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import ms from 'ms';

@Global()
export class JwtUtil {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly jwtService: JwtService,
  ) {}

  verifyAccessToken(token: string): JwtPayloadType {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.getOrThrow('auth.secret', { infer: true }),
      });
      return payload;
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        throw new UnauthorizedException(ErrorCode.TOKEN_EXPIRED);
      } else if (err instanceof JsonWebTokenError)
        throw new UnauthorizedException(ErrorCode.TOKEN_INVALID);
    }
  }

  verifyRefreshToken(token: string): JwtRefreshPayloadType {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.getOrThrow('auth.refreshSecret', {
          infer: true,
        }),
      });
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        throw new UnauthorizedException(ErrorCode.TOKEN_EXPIRED);
      } else if (err instanceof JsonWebTokenError)
        throw new UnauthorizedException(ErrorCode.REFRESH_TOKEN_INVALID);
    }
  }

  async createToken(data: {
    id: string;
    sessionId: string;
    hash: string;
    role: string;
    permissions: string[];
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
          permissions: data.permissions,
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

  async createVerificationToken(data: { id: string }): Promise<string> {
    return this.jwtService.signAsync(
      {
        id: data.id,
      },
      {
        secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
          infer: true,
        }),
        expiresIn: this.configService.getOrThrow('auth.confirmEmailExpires', {
          infer: true,
        }),
      },
    );
  }

  async createForgotPasswordToken(data: { id: string }): Promise<string> {
    return this.jwtService.signAsync(
      {
        id: data.id,
      },
      {
        secret: this.configService.getOrThrow('auth.forgotSecret', {
          infer: true,
        }),
        expiresIn: this.configService.getOrThrow('auth.forgotExpires', {
          infer: true,
        }),
      },
    );
  }

  verifyActivateAccountToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
          infer: true,
        }),
      });
    } catch {
      throw new UnauthorizedException(ErrorCode.TOKEN_INVALID);
    }
  }

  verifyForgotPasswordToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.getOrThrow('auth.forgotSecret', {
          infer: true,
        }),
      });
    } catch {
      throw new UnauthorizedException(ErrorCode.TOKEN_INVALID);
    }
  }
}
