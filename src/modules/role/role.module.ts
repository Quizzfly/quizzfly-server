import { PermissionEntity } from '@modules/permission/entities/permission.entity';
import { PermissionModule } from '@modules/permission/permission.module';
import { RoleEntity } from '@modules/role/entities/role.entity';
import { RoleRepository } from '@modules/role/repositories/role.repository';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleEntity, PermissionEntity]),
    PermissionModule,
    UserModule,
  ],
  controllers: [RoleController],
  providers: [RoleService, RoleRepository],
})
export class RoleModule {}
