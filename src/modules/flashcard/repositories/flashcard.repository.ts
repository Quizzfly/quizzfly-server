import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { FlashcardEntity } from '../entities/flashcard.entity';

@Injectable()
export class FlashcardRepository extends Repository<FlashcardEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(FlashcardEntity, dataSource.createEntityManager());
  }
}
