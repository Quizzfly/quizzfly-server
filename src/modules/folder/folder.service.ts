import { Uuid } from '@common/types/common.type';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { CreateFolderReqDto } from './dto/request/create-folder.req.dto';
import { CreateShareReqDto } from './dto/request/create-share.req.dto';
import { UpdateFolderReqDto } from './dto/request/update-folder.req.dto';
import { FolderShareResDto } from './dto/response/folder-share.res.dto';
import { FolderResDto } from './dto/response/folder.res.dto';
import { FolderPermissionLevel, FolderShareEntity } from './entity/folder-share.entity';
import { FolderEntity } from './entity/folder.entity';
import { FolderShareRepository } from './repository/folder-share.repository';
import { FolderRepository } from './repository/folder.repository';

@Injectable()
export class FolderService {
    constructor(
        private readonly folderRepo: FolderRepository,
        private readonly folderShareRepo: FolderShareRepository,
    ) { }

    async createFolder(ownerId: Uuid, dto: CreateFolderReqDto): Promise<FolderResDto> {
        const folder = await this.folderRepo.save(
            new FolderEntity({
                name: dto.name,
                description: dto.description,
                userId: ownerId,
            }),
        );
        return folder.toDto(FolderResDto);
    }

    async getMyFolders(ownerId: Uuid): Promise<FolderResDto[]> {
        const folders = await this.folderRepo.find({ where: { userId: ownerId } });
        return folders.map((f) => f.toDto(FolderResDto));
    }

    async updateFolder(ownerId: Uuid, folderId: Uuid, dto: UpdateFolderReqDto): Promise<FolderResDto> {
        const folder = await this.folderRepo.findOne({ where: { id: folderId } });
        if (!folder) throw new NotFoundException('Folder not found');
        if (folder.userId !== ownerId) throw new ForbiddenException('Not owner');

        Object.assign(folder, dto);
        await this.folderRepo.save(folder);
        return folder.toDto(FolderResDto);
    }

    async deleteFolder(ownerId: Uuid, folderId: Uuid): Promise<void> {
        const folder = await this.folderRepo.findOne({ where: { id: folderId } });
        if (!folder) return;
        if (folder.userId !== ownerId) throw new ForbiddenException('Not owner');
        await this.folderRepo.softRemove(folder);
    }

    async createShare(ownerId: Uuid, dto: CreateShareReqDto): Promise<FolderShareResDto> {
        const folder = await this.folderRepo.findOne({ where: { id: dto.folderId as Uuid } });
        if (!folder) throw new NotFoundException('Folder not found');
        if (folder.userId !== ownerId) throw new ForbiddenException('Not owner');

        const rawToken = randomBytes(24).toString('hex');
        const shareToken = createHash('sha256').update(rawToken).digest('hex');

        const share = await this.folderShareRepo.save(
            new FolderShareEntity({
                folderId: folder.id,
                ownerId,
                sharedWithEmail: dto.sharedWithEmail,
                shareToken,
                permissionLevel: dto.permissionLevel ?? FolderPermissionLevel.VIEW,
                expiresAt: dto.expiresAt,
                isActive: true,
            }),
        );

        const res = share.toDto(FolderShareResDto);
        res.shareToken = rawToken;
        return res;
    }

    async revokeShare(ownerId: Uuid, shareId: Uuid): Promise<void> {
        const share = await this.folderShareRepo.findOne({ where: { id: shareId } });
        if (!share) return;
        if (share.ownerId !== ownerId) throw new ForbiddenException('Not owner');
        share.isActive = false;
        await this.folderShareRepo.save(share);
    }

    async getFolderByShareToken(rawToken: string): Promise<FolderResDto> {
        const shareToken = createHash('sha256').update(rawToken).digest('hex');
        const share = await this.folderShareRepo.findOne({ where: { shareToken, isActive: true } });
        if (!share) throw new NotFoundException('Share not found');
        if (share.expiresAt && share.expiresAt < new Date()) throw new NotFoundException('Share expired');
        const folder = await this.folderRepo.findOne({ where: { id: share.folderId } });
        if (!folder) throw new NotFoundException('Folder not found');
        return folder.toDto(FolderResDto);
    }
}


