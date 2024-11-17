import { GroupEntity } from '@modules/group/entity/group.entity';
import { MemberInGroupEntity } from '@modules/group/entity/member-in-group.entity';
import { GroupController } from '@modules/group/group.controller';
import { GroupRepository } from '@modules/group/repository/group.repository';
import { MemberInGroupRepository } from '@modules/group/repository/member-in-group.repository';
import { GroupService } from '@modules/group/service/group.service';
import { MemberInGroupService } from '@modules/group/service/member-in-group.service';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([GroupEntity, MemberInGroupEntity]),
    UserModule,
  ],
  controllers: [GroupController],
  providers: [
    GroupService,
    GroupRepository,
    MemberInGroupService,
    MemberInGroupRepository,
  ],
  exports: [GroupService],
})
export class GroupModule {}
