import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupEntity } from '@modules/group/entity/group.entity';
import { GroupService } from '@modules/group/group.service';
import { GroupRepository } from '@modules/group/repository/group.repository';
import { GroupController } from '@modules/group/group.controller';
import { UserModule } from '@modules/user/user.module';
import { MemberInGroupService } from '@modules/group/member-in-group.service';
import { MemberInGroupRepository } from '@modules/group/repository/member-in-group.repository';
import { MemberInGroupEntity } from '@modules/group/entity/member-in-group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GroupEntity, MemberInGroupEntity]), UserModule],
  controllers: [GroupController],
  providers: [GroupService, GroupRepository, MemberInGroupService, MemberInGroupRepository],
  exports: [GroupService],
})
export class GroupModule {}
