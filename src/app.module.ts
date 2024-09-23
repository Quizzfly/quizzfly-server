import generateModulesSet from '@core/utils/modules-set';
import { AuthModule } from '@modules//auth/auth.module';
import { HealthModule } from '@modules/health/health.module';
import { HomeModule } from '@modules/home/home.module';
import { Module } from '@nestjs/common';

const modulesGenerate = generateModulesSet();
@Module({
  imports: [...modulesGenerate, HealthModule, AuthModule, HomeModule],
})
export class AppModule {}
