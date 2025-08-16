import { Uuid } from '@common/types/common.type';
import { ActionList, ResourceList } from '@core/constants/app.constant';
import { CurrentUser } from '@core/decorators/current-user.decorator';
import { ApiAuth } from '@core/decorators/http.decorators';
import { ValidateUuid } from '@core/decorators/validators/uuid-validator';
import { PermissionGuard } from '@core/guards/permission.guard';
import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateFolderReqDto } from './dto/request/create-folder.req.dto';
import { CreateShareReqDto } from './dto/request/create-share.req.dto';
import { UpdateFolderReqDto } from './dto/request/update-folder.req.dto';
import { FolderShareResDto } from './dto/response/folder-share.res.dto';
import { FolderResDto } from './dto/response/folder.res.dto';
import { FolderService } from './folder.service';

@Controller({ version: '1' })
@ApiTags('Folder APIs')
@UseGuards(PermissionGuard)
export class FolderController {
    constructor(private readonly folderService: FolderService) { }

    @ApiAuth({
        summary: 'Create a folder',
        statusCode: HttpStatus.CREATED,
        type: FolderResDto,
        permissions: [{ resource: ResourceList.FOLDER, actions: [ActionList.CREATE] }],
    })
    @Post('folders')
    async createFolder(
        @CurrentUser('id') userId: Uuid,
        @Body() dto: CreateFolderReqDto,
    ) {
        return this.folderService.createFolder(userId, dto);
    }

    @ApiAuth({
        summary: 'Get my folders',
        type: FolderResDto,
        isArray: true,
        permissions: [{ resource: ResourceList.FOLDER, actions: [ActionList.READ] }],
    })
    @Get('folders')
    async getMyFolders(@CurrentUser('id') userId: Uuid) {
        return this.folderService.getMyFolders(userId);
    }

    @ApiAuth({
        summary: 'Update a folder',
        type: FolderResDto,
        permissions: [{ resource: ResourceList.FOLDER, actions: [ActionList.UPDATE] }],
    })
    @ApiParam({ name: 'folderId', description: 'The UUID of the Folder', type: 'string' })
    @Put('folders/:folderId')
    async updateFolder(
        @CurrentUser('id') userId: Uuid,
        @Param('folderId', ValidateUuid) folderId: Uuid,
        @Body() dto: UpdateFolderReqDto,
    ) {
        return this.folderService.updateFolder(userId, folderId, dto);
    }

    @ApiAuth({
        summary: 'Delete a folder',
        permissions: [{ resource: ResourceList.FOLDER, actions: [ActionList.DELETE] }],
    })
    @ApiParam({ name: 'folderId', description: 'The UUID of the Folder', type: 'string' })
    @Delete('folders/:folderId')
    async deleteFolder(
        @CurrentUser('id') userId: Uuid,
        @Param('folderId', ValidateUuid) folderId: Uuid,
    ) {
        return this.folderService.deleteFolder(userId, folderId);
    }

    @ApiAuth({
        summary: 'Create a folder share link',
        type: FolderShareResDto,
        statusCode: HttpStatus.CREATED,
        permissions: [{ resource: ResourceList.FOLDER, actions: [ActionList.UPDATE] }],
    })
    @Post('folders/shares')
    async createShare(@CurrentUser('id') userId: Uuid, @Body() dto: CreateShareReqDto) {
        return this.folderService.createShare(userId, dto);
    }

    @ApiAuth({
        summary: 'Revoke a share link',
        permissions: [{ resource: ResourceList.FOLDER, actions: [ActionList.UPDATE] }],
    })
    @ApiParam({ name: 'shareId', description: 'The UUID of the Share', type: 'string' })
    @Delete('folders/shares/:shareId')
    async revokeShare(@CurrentUser('id') userId: Uuid, @Param('shareId', ValidateUuid) shareId: Uuid) {
        return this.folderService.revokeShare(userId, shareId);
    }

    @ApiAuth({
        summary: 'Get folder by share token',
        type: FolderResDto,
        permissions: [{ resource: ResourceList.FOLDER, actions: [ActionList.READ] }],
    })
    @ApiParam({ name: 'token', description: 'Raw share token', type: 'string' })
    @Get('folders/shares/token/:token')
    async getFolderByShareToken(@Param('token') token: string) {
        return this.folderService.getFolderByShareToken(token);
    }
}


