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

@ApiTags('auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiPublic({
    type: LoginResDto,
    summary: 'Sign in for admin',
  })
  @Post('admin/login')
  async signInAdmin(@Body() userLogin: LoginReqDto): Promise<LoginResDto> {
    return this.authService.signIn(userLogin);
  }

  @ApiAuth({
    summary: 'Logout for admin',
    errorResponses: [400, 401, 403, 500],
  })
  @Post('admin/logout')
  async logoutAdmin(
    @CurrentUser('sessionId') sessionId: string,
  ): Promise<void> {
    await this.authService.logout(sessionId);
  }

  @ApiPublic({
    type: RefreshResDto,
    summary: 'Refresh token for admin',
  })
  @Post('admin/refresh')
  async refreshAdmin(@Body() dto: RefreshReqDto): Promise<RefreshResDto> {
    return this.authService.refreshToken(dto);
  }

  @ApiPublic({
    type: LoginResDto,
    summary: 'Sign in for user',
  })
  @Post('login')
  async signIn(@Body() userLogin: LoginReqDto): Promise<LoginResDto> {
    return this.authService.signIn(userLogin);
  }

  @ApiPublic({
    type: RegisterResDto,
    summary: 'Register for user',
  })
  @Post('register')
  async register(@Body() dto: RegisterReqDto): Promise<RegisterResDto> {
    return this.authService.register(dto);
  }

  @ApiAuth({
    summary: 'Logout for user',
    errorResponses: [400, 401, 403, 500],
  })
  @Post('logout')
  async logout(@CurrentUser('sessionId') sessionId: string): Promise<void> {
    await this.authService.logout(sessionId);
  }

  @ApiPublic({
    type: RefreshResDto,
    summary: 'Refresh token for user',
  })
  @Post('refresh')
  async refresh(@Body() dto: RefreshReqDto): Promise<RefreshResDto> {
    return this.authService.refreshToken(dto);
  }

  @ApiPublic()
  @Post('forgot-password')
  async forgotPassword() {
    return 'forgot-password';
  }

  @ApiPublic()
  @Post('verify/forgot-password')
  async verifyForgotPassword() {
    return 'verify-forgot-password';
  }

  @ApiPublic()
  @Post('reset-password')
  async resetPassword() {
    return 'reset-password';
  }

  @ApiPublic()
  @Post('verify/email')
  async verifyEmail() {
    return 'verify-email';
  }

  @ApiPublic()
  @Post('verify/email/resend')
  async resendVerifyEmail() {
    return 'resend-verify-email';
  }
}
