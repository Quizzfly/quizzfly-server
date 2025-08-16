import { BaseResDto } from '@common/dto/base.res.dto';
import { BooleanField, DateFieldOptional, EnumField, StringFieldOptional, UUIDField } from '@core/decorators/field.decorators';
import { FolderPermissionLevel } from '../../entity/folder-share.entity';

export class FolderShareResDto extends BaseResDto {
    @UUIDField({ name: 'folder_id' })
    folderId!: string;

    @UUIDField({ name: 'owner_id' })
    ownerId!: string;

    @StringFieldOptional({ name: 'shared_with_email' })
    sharedWithEmail?: string;

    @StringFieldOptional({ name: 'share_token' })
    shareToken?: string;

    @EnumField(() => FolderPermissionLevel, { name: 'permission_level' })
    permissionLevel!: FolderPermissionLevel;

    @BooleanField({ name: 'is_active' })
    isActive!: boolean;

    @DateFieldOptional({ name: 'expires_at' })
    expiresAt?: Date;

    @DateFieldOptional({ name: 'email_sent_at' })
    emailSentAt?: Date;
}


