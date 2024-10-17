import { Uuid } from '@common/types/common.type';
import { AbstractEntity } from '@database/entities/abstract.entity';
import { QuizzflyEntity } from '@modules/quizzfly/entity/quizzfly.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('slide', { schema: 'public' })
export class SlideEntity extends AbstractEntity {
  constructor(data?: Partial<SlideEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_slide_id',
  })
  id!: Uuid;

  @Column()
  content: string;

  @Column({ type: 'varchar', array: true })
  files: string[];

  @Column({
    name: 'background_color',
  })
  backgroundColor: string;

  @Column()
  no: number;

  @Column({
    name: 'quizzfly_id',
    type: 'uuid',
  })
  quizzflyId!: Uuid;

  @JoinColumn({
    name: 'quizzfly_id',
  })
  @ManyToOne('QuizzflyEntity', 'slides')
  quizzfly!: QuizzflyEntity;
}