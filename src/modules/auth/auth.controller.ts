import { CurrentUser } from '@core/decorators/current-user.decorator';
import { ApiAuth, ApiPublic } from '@core/decorators/http.decorators';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginReqDto } from './dto/request/login.req.dto';
import { RefreshReqDto } from './dto/request/refresh.req.dto';
import { RegisterReqDto } from './dto/request/register.req.dto';
import { LoginResDto } from './dto/response/login.res.dto';
import { RefreshResDto } from './dto/response/refresh.res.dto';
import { RegisterResDto } from './dto/response/register.res.dto';

@ApiTags('Auth APIs')
@Controller({
  path: '',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiPublic({
    type: LoginResDto,
    summary: 'Sign in for admin',
  })
  @Post('admin/auth/login')
  async signInAdmin(@Body() userLogin: LoginReqDto): Promise<LoginResDto> {
    return this.authService.signInAdmin(userLogin);
  }

  @ApiAuth({
    summary: 'Logout for admin',
    errorResponses: [400, 401, 403, 500],
  })
  @Post('admin/auth/logout')
  async logoutAdmin(
    @CurrentUser('id') id: string,
    @CurrentUser('sessionId') sessionId: string,
  ): Promise<void> {
    await this.authService.logoutAdmin(id, sessionId);
  }

  @ApiPublic({
    type: RefreshResDto,
    summary: 'Refresh token for admin',
  })
  @Post('admin/auth/refresh')
  async refreshAdmin(@Body() dto: RefreshReqDto): Promise<RefreshResDto> {
    return this.authService.refreshTokenAdmin(dto);
  }

  @ApiPublic({
    type: LoginResDto,
    summary: 'Sign in for user',
  })
  @Post('auth/login')
  async signIn(@Body() userLogin: LoginReqDto): Promise<LoginResDto> {
    return this.authService.signIn(userLogin);
  }

  @ApiPublic({
    type: RegisterResDto,
    summary: 'Register for user',
  })
  @Post('auth/register')
  async register(@Body() dto: RegisterReqDto): Promise<RegisterResDto> {
    return this.authService.register(dto);
  }

  @ApiAuth({
    summary: 'Logout for user',
    errorResponses: [400, 401, 403, 500],
  })
  @Post('auth/logout')
  async logout(@CurrentUser('sessionId') sessionId: string): Promise<void> {
    await this.authService.logout(sessionId);
  }

  @ApiPublic({
    type: RefreshResDto,
    summary: 'Refresh token for user',
  })
  @Post('auth/refresh')
  async refresh(@Body() dto: RefreshReqDto): Promise<RefreshResDto> {
    return this.authService.refreshToken(dto);
  }
}
