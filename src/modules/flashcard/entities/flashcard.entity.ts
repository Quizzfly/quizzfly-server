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
@Index('IDX_flashcard_set_rank', ['set_id', 'rank'], { unique: true })
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
  set_id!: string;

  @Column('integer', { default: 0 })
  rank: number;

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
}
