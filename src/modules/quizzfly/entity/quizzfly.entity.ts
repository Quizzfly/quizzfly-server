import { Uuid } from '@common/types/common.type';
import { AbstractEntity } from '@database/entities/abstract.entity';
import { QuizzflyStatus } from '@modules/quizzfly/entity/enums/quizzfly-status.enum';
import { RoomEntity } from '@modules/room/entity/room.entity';
import { SlideEntity } from '@modules/slide/entity/slide.entity';
import { UserEntity } from '@modules/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('quizzfly', { schema: 'public' })
export class QuizzflyEntity extends AbstractEntity {
  constructor(data?: Partial<QuizzflyEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_quizzfly_id',
  })
  id!: Uuid;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ name: 'cover_image' })
  coverImage: string;

  @Column()
  theme: string;

  @Column({ name: 'is_public', type: 'boolean', default: true })
  isPublic?: boolean;

  @Column({
    type: 'enum',
    enum: QuizzflyStatus,
    name: 'quizzfly_status',
  })
  quizzflyStatus: QuizzflyStatus;

  @Column({
    name: 'user_id',
    type: 'uuid',
  })
  userId!: Uuid;

  @JoinColumn({
    name: 'user_id',
  })
  @ManyToOne('UserEntity', 'quizzflys')
  user!: UserEntity;

  @OneToMany('SlideEntity', 'quizzfly')
  slides?: SlideEntity[];

  @OneToMany('RoomEntity', 'quizzfly')
  rooms?: RoomEntity[];
}
