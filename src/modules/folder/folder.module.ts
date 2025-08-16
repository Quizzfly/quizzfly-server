import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FolderShareEntity } from './entity/folder-share.entity';
import { FolderEntity } from './entity/folder.entity';
import { FolderController } from './folder.controller';
import { FolderService } from './folder.service';
import { FolderShareRepository } from './repository/folder-share.repository';
import { FolderRepository } from './repository/folder.repository';

@Module({
    imports: [TypeOrmModule.forFeature([FolderEntity, FolderShareEntity])],
    controllers: [FolderController],
    providers: [FolderService, FolderRepository, FolderShareRepository],
    exports: [FolderService],
})
export class FolderModule { }


