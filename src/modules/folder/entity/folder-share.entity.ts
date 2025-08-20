import { Uuid } from '@common/types/common.type';
import { AbstractEntity } from '@database/entities/abstract.entity';
import { UserEntity } from '@modules/user/entities/user.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { FolderEntity } from './folder.entity';

export enum FolderPermissionLevel {
    VIEW = 'view',
    EDIT = 'edit',
}

@Entity('folder_share', { schema: 'public' })
export class FolderShareEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_folder_share_id' })
    id!: Uuid;

    @Column({ name: 'folder_id', type: 'uuid' })
    @Index('IDX_folder_share_folder_id')
    folderId!: Uuid;

    @JoinColumn({ name: 'folder_id', referencedColumnName: 'id', foreignKeyConstraintName: 'FK_folder_share_folder' })
    @ManyToOne(() => FolderEntity)
    folder!: Relation<FolderEntity>;

    @Column({ name: 'owner_id', type: 'uuid' })
    @Index('IDX_folder_share_owner_id')
    ownerId!: Uuid;

    @JoinColumn({ name: 'owner_id', referencedColumnName: 'id', foreignKeyConstraintName: 'FK_folder_share_owner' })
    @ManyToOne(() => UserEntity)
    owner!: Relation<UserEntity>;

    @Column({ name: 'shared_with_email', type: 'varchar', length: 100, nullable: true })
    @Index('IDX_folder_share_shared_with_email')
    sharedWithEmail?: string;

    @Column({ name: 'share_token', type: 'varchar', length: 255, unique: true })
    shareToken!: string;

    @Column({ name: 'permission_level', type: 'enum', enum: FolderPermissionLevel, default: FolderPermissionLevel.VIEW })
    permissionLevel!: FolderPermissionLevel;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive?: boolean;

    @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
    expiresAt?: Date;

    @Column({ name: 'email_sent_at', type: 'timestamptz', nullable: true })
    emailSentAt?: Date;

    constructor(data?: Partial<FolderShareEntity>) {
        super();
        Object.assign(this, data);
    }
}


