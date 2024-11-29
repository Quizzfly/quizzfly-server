import { Uuid } from '@common/types/common.type';
import { AbstractEntity } from '@database/entities/abstract.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('player_answer', { schema: 'public' })
export class PlayerAnswerEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_player_answer_id',
  })
  id!: Uuid;

  @Column({ type: 'uuid', name: 'question_id' })
  questionId!: Uuid;

  @Column({ type: 'uuid', name: 'player_id' })
  playerId!: Uuid;

  @Column({ type: 'uuid', name: 'chosen_answer_id' })
  chosenAnswerId: Uuid;

  @Column({ name: 'is_correct' })
  isCorrect: boolean;

  @Column()
  score: number;
}
