import { BaseResDto } from '@common/dto/base.res.dto';
import { Uuid } from '@common/types/common.type';
import { Column } from 'typeorm';

export class ParticipantResDto extends BaseResDto {
  @Column({ name: 'socket_id', nullable: true, default: null })
  socketId?: string;

  @Column({ name: 'nick_name' })
  nickName: string;

  @Column({ name: 'room_id', type: 'uuid' })
  roomId!: Uuid;

  @Column({ name: 'room_pin' })
  roomPin!: string;

  @Column({ name: 'total_score', default: 0 })
  totalScore: number;

  @Column({ nullable: true, default: null })
  rank: number;

  @Column({
    name: 'time_join',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  timeJoin: Date;

  @Column({
    name: 'time_left',
    type: 'timestamptz',
    nullable: true,
    default: null,
  })
  timeLeft: Date;

  @Column({
    name: 'time_kicked',
    type: 'timestamptz',
    nullable: true,
    default: null,
  })
  timeKicked: Date;

  @Column({ name: 'correct_count', default: 0 })
  correctCount: number;

  @Column({ name: 'incorrect_count', default: 0 })
  incorrectCount: number;

  @Column({ name: 'unanswered_count', default: 0 })
  unansweredCount: number;
}
