import { Uuid } from '@common/types/common.type';
import { AbstractEntity } from '@database/entities/abstract.entity';
import { QuizType } from '@modules/quiz/enums/quiz-type.enum';
import { QuizzflyEntity } from '@modules/quizzfly/entity/quizzfly.entity';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity('quiz', { schema: 'public' })
export class QuizEntity extends AbstractEntity {
  constructor(data?: Partial<QuizEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_quiz_id',
  })
  id!: Uuid;

  @Column()
  content: string;

  @Column({
    name: 'time_limit',
    type: 'int',
  })
  timeLimit: number;

  @Column({ name: 'point_multiplier' })
  pointMultiplier: number;

  @Column({
    type: 'enum',
    enum: QuizType,
    name: 'quiz_type',
  })
  quizType: QuizType;

  @Column('jsonb', { default: [] })
  files: object[];

  @Column('int')
  no: number;

  @Column({
    name: 'quizzfly_id',
    type: 'uuid',
  })
  quizzflyId!: Uuid;

  @ManyToOne(() => QuizzflyEntity, (quizzfly) => quizzfly.quizzes)
  quizzfly: Relation<QuizzflyEntity>;
}
