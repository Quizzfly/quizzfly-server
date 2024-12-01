import { Uuid } from '@common/types/common.type';
import { AbstractEntity } from '@database/entities/abstract.entity';
import { ParticipantAnswerEntity } from '@modules/room/entities/participant-answer.entity';
import { RoomEntity } from '@modules/room/entities/room.entity';
import { UserEntity } from '@modules/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity('participant_in_room', { schema: 'public' })
export class ParticipantInRoomEntity extends AbstractEntity {
  constructor(data?: Partial<ParticipantInRoomEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_participant_in_room_id',
  })
  id!: Uuid;

  @Column({ name: 'socket_id', nullable: true, default: null })
  socketId?: string;

  @Column({ name: 'user_id', nullable: true, default: null })
  userId?: Uuid;

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

  @JoinColumn({ name: 'user_id' })
  @ManyToOne(() => UserEntity, (user) => user.participantInRooms)
  user?: Relation<UserEntity>;

  @JoinColumn({ name: 'room_id' })
  @ManyToOne(() => RoomEntity, (room) => room.participantInRooms)
  room!: RoomEntity;

  @OneToMany(
    () => ParticipantAnswerEntity,
    (participantAnswer) => participantAnswer.participant,
  )
  participantAnswers: ParticipantAnswerEntity[];
}
