import { Uuid } from '@common/types/common.type';
import { AbstractEntity } from '@database/entities/abstract.entity';
import { QuizzflyEntity } from '@modules/quizzfly/entity/quizzfly.entity';
import { RoomStatus } from '@modules/room/entities/constants/room-status.enum';
import { PlayerInRoomEntity } from '@modules/room/entities/player-in-room.entity';
import { QuestionEntity } from '@modules/room/entities/question.entity';
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

@Entity('room', { schema: 'public' })
export class RoomEntity extends AbstractEntity {
  constructor(data?: Partial<RoomEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_room_id',
  })
  id!: Uuid;

  @Column({ name: 'room_pin' })
  roomPin: string;

  @Column({
    name: 'start_time',
    nullable: true,
    default: null,
    type: 'timestamptz',
  })
  startTime: Date;

  @Column({
    name: 'end_time',
    nullable: true,
    default: null,
    type: 'timestamptz',
  })
  endTime: Date;

  @Column({
    type: 'enum',
    enum: RoomStatus,
    name: 'room_status',
  })
  roomStatus: RoomStatus;

  @Column({
    name: 'is_show_question',
  })
  isShowQuestion: boolean;

  @Column({ name: 'is_auto_play' })
  isAutoPlay: boolean;

  @Column({ name: 'lobby_music' })
  lobbyMusic: string;

  @Column({ name: 'locked' })
  locked: boolean;

  @Column({
    name: 'quizzfly_id',
    type: 'uuid',
  })
  quizzflyId!: Uuid;

  @JoinColumn({
    name: 'quizzfly_id',
  })
  @ManyToOne('QuizzflyEntity', 'rooms')
  quizzfly!: QuizzflyEntity;

  @Column({
    name: 'host_id',
    type: 'uuid',
  })
  hostId!: Uuid;

  @JoinColumn({
    name: 'host_id',
  })
  @ManyToOne('UserEntity', 'rooms')
  user!: Relation<UserEntity>;

  @OneToMany(() => PlayerInRoomEntity, (playerInRoom) => playerInRoom.room)
  playerInRooms?: PlayerInRoomEntity[];

  @OneToMany(() => QuestionEntity, (question) => question.room)
  questions?: QuestionEntity[];
}
