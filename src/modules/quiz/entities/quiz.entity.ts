import { Uuid } from '@common/types/common.type';
import { AbstractEntity } from '@database/entities/abstract.entity';
import { AnswerEntity } from '@modules/answer/entities/answer.entity';
import { FileResDto } from '@modules/file/dto/file.res.dto';
import { QuizType } from '@modules/quiz/enums/quiz-type.enum';
import { QuizzflyEntity } from '@modules/quizzfly/entity/quizzfly.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity('quiz', { schema: 'public' })
export class QuizEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_quiz_id',
  })
  id!: Uuid;

  @Column()
  content: string = null;

  @Column({ name: 'time_limit', type: 'int' })
  timeLimit: number;

  @Column({ name: 'point_multiplier' })
  pointMultiplier: number = 1;

  @Column({
    type: 'enum',
    enum: QuizType,
    name: 'quiz_type',
  })
  quizType: QuizType;

  @Column('jsonb', { default: [] })
  files?: FileResDto[];

  @Column({ name: 'prev_element_id', type: 'uuid', nullable: true })
  prevElementId: Uuid | null;

  @Column({ name: 'background_url' })
  backgroundUrl: string = null;

  @Column({
    name: 'quizzfly_id',
    type: 'uuid',
  })
  quizzflyId!: Uuid;

  @JoinColumn({
    name: 'quizzfly_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_quizzfly_quiz',
  })
  @ManyToOne(() => QuizzflyEntity, (quizzfly) => quizzfly.quizzes)
  quizzfly: Relation<QuizzflyEntity>;

  @OneToMany(() => AnswerEntity, (answer) => answer.quiz)
  answers?: AnswerEntity[];

  constructor(data?: Partial<QuizEntity>) {
    super();
    Object.assign(this, data);
  }
}
