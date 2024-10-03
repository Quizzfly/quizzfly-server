import { AuthModule } from '@modules//auth/auth.module';
import { HealthModule } from '@modules/health/health.module';
import { HomeModule } from '@modules/home/home.module';
import { SessionModule } from '@modules/session/session.module';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
import generateModulesSet from '@shared/modules-set';
import { SharedModule } from '@shared/shared.module';

const modulesGenerate = generateModulesSet();

@Module({
  imports: [
    ...modulesGenerate,
    HealthModule,
    AuthModule,
    HomeModule,
    UserModule,
    SessionModule,
    SharedModule,
  ],
})
export class AppModule {}
