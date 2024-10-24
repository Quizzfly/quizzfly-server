import { FileDto } from '@common/dto/file.dto';
import { Uuid } from '@common/types/common.type';
import { AbstractEntity } from '@database/entities/abstract.entity';
import { QuizEntity } from '@modules/quiz/entities/quiz.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity('answer', { schema: 'public' })
export class AnswerEntity extends AbstractEntity {
  constructor(data?: Partial<AnswerEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_answer_id',
  })
  id!: Uuid;

  @Column()
  content: string;

  @Column({ name: 'is_correct', default: false })
  isCorrect: boolean;

  @Column('jsonb', { default: [] })
  files?: FileDto[];

  @Column({
    name: 'quiz_id',
    type: 'uuid',
  })
  quizId!: Uuid;

  @JoinColumn({
    name: 'quiz_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_answer_quiz',
  })
  @ManyToOne(() => QuizEntity, (quiz) => quiz.answers)
  quiz!: Relation<QuizEntity>;
}
