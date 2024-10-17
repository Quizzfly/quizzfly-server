import { SlideEntity } from '@modules/slide/entity/slide.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class SlideRepository extends Repository<SlideEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(SlideEntity, dataSource.createEntityManager());
  }
}
