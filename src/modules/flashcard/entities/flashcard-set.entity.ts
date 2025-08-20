import { AbstractEntity } from '@/database/entities/abstract.entity';
import { UserEntity } from '@/modules/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { FLASHCARD_VISIBILITY } from '../enums';
import { FlashcardEntity } from './flashcard.entity';

@Entity('flashcard_set', { schema: 'public' })
export class FlashcardSetEntity extends AbstractEntity {
  constructor(data?: Partial<FlashcardSetEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_flashcard_set_id',
  })
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  owner_id?: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'owner_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_flashcard_set_owner_id',
  })
  owner?: Relation<UserEntity>;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column('varchar', {
    default: FLASHCARD_VISIBILITY.PRIVATE,
  })
  visibility: FLASHCARD_VISIBILITY;

  @OneToMany(() => FlashcardEntity, (flashCard) => flashCard.set, {
    cascade: true,
  })
  flashcards: Relation<FlashcardEntity[]>;

  canRead(userId: string) {
    return (
      this.visibility === FLASHCARD_VISIBILITY.PUBLIC ||
      this.owner_id === userId
    );
  }

  canUpdate(userId: string) {
    return this.owner_id === userId;
  }

  canDelete(userId: string) {
    return this.owner_id === userId;
  }

  canAddFLashCard(userId: string) {
    return this.owner_id === userId;
  }
}
