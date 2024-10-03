import { AuthModule } from '@modules//auth/auth.module';
import { FileModule } from '@modules/file/file.module';
import { HealthModule } from '@modules/health/health.module';
import { HomeModule } from '@modules/home/home.module';
import { Module } from '@nestjs/common';
import generateModulesSet from '@shared/modules-set';

const modulesGenerate = generateModulesSet();
@Module({
  imports: [
    ...modulesGenerate,
    HealthModule,
    AuthModule,
    HomeModule,
    FileModule,
  ],
})
export class AppModule {}
