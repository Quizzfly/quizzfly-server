import { AuthModule } from '@modules//auth/auth.module';
import { AnswerModule } from '@modules/answer/answer.module';
import { FileModule } from '@modules/file/file.module';
import { GroupModule } from '@modules/group/group.module';
import { HealthModule } from '@modules/health/health.module';
import { NotificationModule } from '@modules/notification/notification.module';
import { PermissionModule } from '@modules/permission/permission.module';
import { QuizModule } from '@modules/quiz/quiz.module';
import { QuizzflyModule } from '@modules/quizzfly/quizzfly.module';
import { RoleModule } from '@modules/role/role.module';
import { RoomModule } from '@modules/room/room.module';
import { SessionModule } from '@modules/session/session.module';
import { SlideModule } from '@modules/slide/slide.module';
import { SubscriptionModule } from '@modules/subscription/subscription.module';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import generateModulesSet from '@shared/modules-set';
import { SharedModule } from '@shared/shared.module';

const modulesGenerate = generateModulesSet();

@Module({
  imports: [
    ...modulesGenerate,
    EventEmitterModule.forRoot(),
    HealthModule,
    AuthModule,
    UserModule,
    SessionModule,
    RoleModule,
    PermissionModule,
    SharedModule,
    FileModule,
    QuizzflyModule,
    SlideModule,
    QuizModule,
    AnswerModule,
    RoomModule,
    GroupModule,
    NotificationModule,
    SubscriptionModule,
  ],
})
export class AppModule {}
