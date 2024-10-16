import { AuthModule } from '@modules//auth/auth.module';
import { AnswerModule } from '@modules/answer/answer.module';
import { FileModule } from '@modules/file/file.module';
import { HealthModule } from '@modules/health/health.module';
import { QuizModule } from '@modules/quiz/quiz.module';
import { QuizzflyModule } from '@modules/quizzfly/quizzfly.module';
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
    UserModule,
    SessionModule,
    SharedModule,
    FileModule,
    QuizzflyModule,
    QuizModule,
    AnswerModule,
  ],
})
export class AppModule {}
