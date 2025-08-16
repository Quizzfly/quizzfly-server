import { Uuid } from '@common/types/common.type';
import { DateFieldOptional, EnumFieldOptional, StringFieldOptional, UUIDField } from '@core/decorators/field.decorators';
import { FolderPermissionLevel } from '../../entity/folder-share.entity';

export class CreateShareReqDto {
    @UUIDField({ name: 'folder_id' })
    folderId!: Uuid;

    @StringFieldOptional({ name: 'shared_with_email' })
    sharedWithEmail?: string;

    @EnumFieldOptional(() => FolderPermissionLevel, {
        name: 'permission_level',
        default: FolderPermissionLevel.VIEW,
    })
    permissionLevel?: FolderPermissionLevel = FolderPermissionLevel.VIEW;

    @DateFieldOptional({ name: 'expires_at' })
    expiresAt?: Date;
}


