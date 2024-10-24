import { FileDto } from '@common/dto/file.dto';
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

  @Column('jsonb', { default: [] })
  files?: FileDto[];

  @Column({
    name: 'background_color',
  })
  backgroundColor: string;

  @Column({ name: 'prev_element_id', type: 'uuid', nullable: true })
  prevElementId: Uuid | null;

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
