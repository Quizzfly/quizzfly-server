import { ROLE } from '@core/constants/entity.enum';
import { TOKEN_TYPE } from '@core/constants/token-type.enum';
import { CurrentUser } from '@core/decorators/current-user.decorator';
import { ApiAuth, ApiPublic } from '@core/decorators/http.decorators';
import { RolesGuard } from '@core/guards/role.guard';
import { AuthConfirmEmailDto } from '@modules/auth/dto/request/auth-confirm-email.dto';
import { AuthResetPasswordDto } from '@modules/auth/dto/request/auth-reset-password.dto';
import { EmailDto } from '@modules/auth/dto/request/email.dto';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
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
    return this.authService.signIn(userLogin, true);
  }

  @ApiPublic({
    type: RefreshResDto,
    summary: 'Refresh token for admin',
  })
  @Post('admin/auth/refresh')
  async refreshAdmin(@Body() dto: RefreshReqDto): Promise<RefreshResDto> {
    return this.authService.refreshToken(dto, true);
  }

  @ApiAuth({
    summary: 'Logout for admin',
    roles: [ROLE.ADMIN],
  })
  @UseGuards(RolesGuard)
  @Post('admin/auth/logout')
  async logoutAdmin(
    @CurrentUser('sessionId') sessionId: string,
  ): Promise<void> {
    await this.authService.logout(sessionId);
  }

  @ApiPublic({
    type: RegisterResDto,
    summary: 'Register for user',
  })
  @Post('auth/register')
  async register(@Body() dto: RegisterReqDto): Promise<RegisterResDto> {
    return this.authService.register(dto);
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
    type: RefreshResDto,
    summary: 'Refresh token for user',
  })
  @Post('auth/refresh')
  async refresh(@Body() dto: RefreshReqDto): Promise<RefreshResDto> {
    return this.authService.refreshToken(dto);
  }

  @ApiAuth({
    summary: 'Logout for user',
    statusCode: HttpStatus.NO_CONTENT,
  })
  @Post('auth/logout')
  async logout(@CurrentUser('sessionId') sessionId: string): Promise<void> {
    await this.authService.logout(sessionId);
  }

  @ApiPublic({
    summary: 'Email verification to activate account',
    statusCode: HttpStatus.NO_CONTENT,
  })
  @Get('auth/verify-email')
  async verifyEmail(@Query() query: AuthConfirmEmailDto) {
    return this.authService.verifyEmailToken(
      query.token,
      TOKEN_TYPE.ACTIVATION,
    );
  }

  @ApiPublic({
    summary: 'Resend verification email',
    statusCode: HttpStatus.NO_CONTENT,
  })
  @Post('auth/resend-verify-email')
  async resendVerifyEmail(@Body() dto: EmailDto) {
    return this.authService.resendEmailActivation(dto);
  }

  @ApiPublic({
    summary: 'Forgot password verification link',
    statusCode: HttpStatus.NO_CONTENT,
  })
  @Post('auth/forgot-password')
  async forgotPassword(@Body() dto: EmailDto) {
    return this.authService.forgotPassword(dto);
  }

  @ApiPublic({
    summary: 'Verify email reset password link',
    statusCode: HttpStatus.NO_CONTENT,
  })
  @Get('auth/verify-reset-password-link')
  async verifyResetPassword(@Query() query: AuthConfirmEmailDto) {
    return this.authService.verifyEmailToken(
      query.token,
      TOKEN_TYPE.FORGOT_PASSWORD,
    );
  }

  @ApiPublic({
    summary: 'Reset password',
    statusCode: HttpStatus.NO_CONTENT,
  })
  @Post('auth/reset-password')
  resetPassword(@Body() dto: AuthResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
