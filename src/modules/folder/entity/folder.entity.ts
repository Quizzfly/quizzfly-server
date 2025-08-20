import { Uuid } from '@common/types/common.type';
import { AbstractEntity } from '@database/entities/abstract.entity';
import { UserEntity } from '@modules/user/entities/user.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';

@Entity('folder', { schema: 'public' })
export class FolderEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_folder_id' })
    id!: Uuid;

    @Column({ length: 100 })
    name!: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ name: 'user_id', type: 'uuid' })
    @Index('IDX_folder_user_id')
    userId!: Uuid;

    @JoinColumn({ name: 'user_id', referencedColumnName: 'id', foreignKeyConstraintName: 'FK_folder_user' })
    @ManyToOne(() => UserEntity)
    user!: Relation<UserEntity>;

    @Column({ name: 'is_public', type: 'boolean', default: false })
    isPublic?: boolean;

    constructor(data?: Partial<FolderEntity>) {
        super();
        Object.assign(this, data);
    }
}


