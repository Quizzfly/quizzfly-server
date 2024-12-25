import { PermissionEntity } from '@modules/permission/entities/permission.entity';
import { PermissionModule } from '@modules/permission/permission.module';
import { RoleEntity } from '@modules/role/entities/role.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleEntity, PermissionEntity]),
    PermissionModule,
  ],
  controllers: [RoleController],
  providers: [RoleService],
})
export class RoleModule {}
