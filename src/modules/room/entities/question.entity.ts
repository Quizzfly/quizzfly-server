import { Uuid } from '@common/types/common.type';
import { AbstractEntity } from '@database/entities/abstract.entity';
import { FileResDto } from '@modules/file/dto/file.res.dto';
import { QuizType } from '@modules/quiz/enums/quiz-type.enum';
import { ParticipantAnswerEntity } from '@modules/room/entities/participant-answer.entity';
import { RoomEntity } from '@modules/room/entities/room.entity';
import { Expose } from 'class-transformer';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
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
  @Expose()
  id!: Uuid;

  @Column({ name: 'room_id', type: 'uuid' })
  @Expose()
  roomId!: Uuid;

  @Column()
  @Expose()
  type: string;

  @Column({
    type: 'enum',
    enum: QuizType,
    name: 'quiz_type',
  })
  @Expose()
  quizType: QuizType;

  @Column({
    name: 'start_time',
    nullable: true,
    default: null,
    type: 'timestamptz',
  })
  @Expose()
  startTime: Date;

  @Column({ default: false })
  @Expose()
  done: boolean;

  @Column({ type: 'uuid', name: 'correct_answer_id', default: null })
  @Expose()
  correctAnswerId: Uuid;

  @Column({ default: null })
  @Expose()
  content: string;

  @Column({ name: 'time_limit', default: null })
  @Expose()
  timeLimit: number;

  @Column({ name: 'point_multiplier', default: null })
  @Expose()
  pointMultiplier: number;

  @Column('jsonb', { default: [] })
  @Expose()
  files?: FileResDto[];

  @Column({ name: 'background_url', default: null })
  @Expose()
  backgroundUrl: string;

  @Column({ name: 'question_index' })
  @Expose()
  questionIndex: number;

  @Column({ type: 'jsonb', nullable: true, default: null })
  @Expose()
  choices?: Record<Uuid, number>;

  @Column({ type: 'jsonb', nullable: true, default: null })
  @Expose()
  answers?: Record<Uuid, AnswerInRoom>;

  @JoinColumn({ name: 'room_id' })
  @ManyToOne(() => RoomEntity, (room) => room.questions)
  room!: Relation<RoomEntity>;

  @OneToMany(
    () => ParticipantAnswerEntity,
    (participantAnswer) => participantAnswer.question,
  )
  participantAnswers: ParticipantAnswerEntity[];
}
