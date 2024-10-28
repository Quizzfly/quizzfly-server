import { SessionModule } from '@modules/session/session.module';
import { UserInfoEntity } from '@modules/user/entities/user-info.entity';
import { UserEntity } from '@modules/user/entities/user.entity';
import { UserInfoRepository } from '@modules/user/repositories/user-info.repository';
import { UserRepository } from '@modules/user/repositories/user.repository';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, UserInfoEntity]),
    SessionModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository, UserInfoRepository],
  exports: [UserService],
})
export class UserModule {}
