import { AuthModule } from '@modules//auth/auth.module';
import { FileModule } from '@modules/file/file.module';
import { HealthModule } from '@modules/health/health.module';
import { QuizzflyModule } from '@modules/quizzfly/quizzfly.module';
import { SessionModule } from '@modules/session/session.module';
import { SlideModule } from '@modules/slide/slide.module';
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
    UserModule,
    SessionModule,
    SharedModule,
    FileModule,
    QuizzflyModule,
    SlideModule,
  ],
})
export class AppModule {}
