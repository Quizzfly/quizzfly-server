import { CoreModule } from '@core/core.module';
import { SessionModule } from '@modules/session/session.module';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [UserModule, SessionModule, CoreModule, HttpModule.register({}),],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
