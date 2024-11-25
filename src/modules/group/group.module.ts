import { GroupController } from '@modules/group/controller/group.controller';
import { PostController } from '@modules/group/controller/post.controller';
import { GroupEntity } from '@modules/group/entity/group.entity';
import { MemberInGroupEntity } from '@modules/group/entity/member-in-group.entity';
import { PostEntity } from '@modules/group/entity/post.entity';
import { GroupRepository } from '@modules/group/repository/group.repository';
import { MemberInGroupRepository } from '@modules/group/repository/member-in-group.repository';
import { PostRepository } from '@modules/group/repository/post.repository';
import { ReactPostRepository } from '@modules/group/repository/react-post.repository';
import { GroupService } from '@modules/group/service/group.service';
import { MemberInGroupService } from '@modules/group/service/member-in-group.service';
import { PostService } from '@modules/group/service/post.service';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([GroupEntity, MemberInGroupEntity, PostEntity]),
    UserModule,
  ],
  controllers: [GroupController, PostController],
  providers: [
    GroupService,
    GroupRepository,
    MemberInGroupService,
    MemberInGroupRepository,
    ReactPostRepository,
    PostRepository,
    PostService,
  ],
  exports: [GroupService],
})
export class GroupModule {}
