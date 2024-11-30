import { Uuid } from '@common/types/common.type';
import { AbstractEntity } from '@database/entities/abstract.entity';
import { ParticipantInRoomEntity } from '@modules/room/entities/participant-in-room.entity';
import { QuestionEntity } from '@modules/room/entities/question.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity('participant_answer', { schema: 'public' })
export class ParticipantAnswerEntity extends AbstractEntity {
  constructor(data?: Partial<ParticipantAnswerEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_participant_answer_id',
  })
  id!: Uuid;

  @Column({ type: 'uuid', name: 'question_id' })
  questionId!: Uuid;

  @Column({ type: 'uuid', name: 'participant_id' })
  participantId!: Uuid;

  @Column({ type: 'uuid', name: 'chosen_answer_id' })
  chosenAnswerId: Uuid;

  @Column({ name: 'is_correct' })
  isCorrect: boolean;

  @Column()
  score: number;

  @JoinColumn({ name: 'question_id' })
  @ManyToOne(() => QuestionEntity, (question) => question.participantAnswers)
  question: QuestionEntity;

  @JoinColumn({ name: 'participant_id' })
  @ManyToOne(
    () => ParticipantInRoomEntity,
    (participant) => participant.participantAnswers,
  )
  participant: Relation<ParticipantInRoomEntity>;
}
