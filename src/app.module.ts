import generateModulesSet from '@core/utils/modules-set';
import { AuthModule } from '@modules//auth/auth.module';
import { UserModule } from '@modules//user/user.module';
import { HealthModule } from '@modules/health/health.module';
import { HomeModule } from '@modules/home/home.module';
import { PostModule } from '@modules/post/post.module';
import { Module } from '@nestjs/common';

const modulesGenerate = generateModulesSet();
@Module({
  imports: [
    ...modulesGenerate,
    UserModule,
    HealthModule,
    AuthModule,
    HomeModule,
    PostModule,
  ],
})
export class AppModule {}
