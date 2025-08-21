import { Uuid } from '@/common/types/common.type';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { FlashcardSetEntity } from './flashcard-set.entity';

@Entity('flashcard', { schema: 'public' })
@Index('IDX_flashcard_set_sort_order', ['set_id', 'sort_order'], {
  unique: true,
})
@Index('IDX_flashcard_set_question', ['set_id', 'question'], {
  unique: true,
})
export class FlashcardEntity extends AbstractEntity {
  constructor(data?: Partial<FlashcardEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_flashcard_id',
  })
  id!: string;

  @Column('uuid')
  set_id!: Uuid;

  @Column('int', { nullable: false })
  sort_order: number;

  @ManyToOne(() => FlashcardSetEntity, (set) => set.flashcards)
  @JoinColumn({
    name: 'set_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_flashcard_set_id',
  })
  set: Relation<FlashcardSetEntity>;

  @Column('text', { nullable: false })
  question: string;

  @Column('text', { nullable: false })
  answer: string;

  @Column('varchar', { nullable: true, length: 500 })
  image_url: string;

  @Column('varchar', { nullable: true, length: 500 })
  audio_url: string;

  @Column('varchar', { nullable: true, array: true })
  options: string[];

  canUpdate(userId: string) {
    return this.set?.owner_id === userId;
  }

  canDelete(userId: string) {
    return this.set?.owner_id === userId;
  }

  canReorder(userId: string) {
    return this.set?.owner_id === userId;
  }
}
