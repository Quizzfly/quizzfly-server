import { Uuid } from '@common/types/common.type';
import { AbstractEntity } from '@database/entities/abstract.entity';
import { FileResDto } from '@modules/file/dto/file.res.dto';
import { QuizType } from '@modules/quiz/enums/quiz-type.enum';
import { RoomEntity } from '@modules/room/entities/room.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

export interface AnswerInRoom {
  id: Uuid;
  content: string;
  isCorrect: boolean;
  files?: FileResDto[];
  index: number;
}

@Entity('question', { schema: 'public' })
export class QuestionEntity extends AbstractEntity {
  constructor(data?: Partial<QuestionEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_question_id',
  })
  id!: Uuid;

  @Column({ name: 'room_id', type: 'uuid' })
  roomId!: Uuid;

  @Column()
  type: string;

  @Column({
    type: 'enum',
    enum: QuizType,
    name: 'quiz_type',
  })
  quizType: QuizType;

  @Column({
    name: 'start_time',
    nullable: true,
    default: null,
    type: 'timestamptz',
  })
  startTime: Date;

  @Column({ default: false })
  done: boolean;

  @Column({ type: 'uuid', name: 'correct_answer_id', default: null })
  correctAnswerId: Uuid;

  @Column({ default: null })
  content: string;

  @Column({ name: 'time_limit', default: null })
  timeLimit: number;

  @Column({ name: 'point_multiplier', default: null })
  pointMultiplier: number;

  @Column('jsonb', { default: [] })
  files?: FileResDto[];

  @Column({ name: 'background_url', default: null })
  backgroundUrl: string;

  @Column({ name: 'question_index' })
  questionIndex: number;

  @Column({ type: 'jsonb', nullable: true, default: null })
  choices?: Record<Uuid, number>;

  @Column({ type: 'jsonb', nullable: true, default: null })
  answers?: Record<Uuid, AnswerInRoom>;

  @JoinColumn({ name: 'room_id' })
  @ManyToOne(() => RoomEntity, (room) => room.questions)
  room!: Relation<RoomEntity>;
}
