import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlashcardSetController } from './controller/flashcard-set.controller';
import { FlashCardController } from './controller/flashcard.controller';
import { FlashcardSetEntity } from './entities/flashcard-set.entity';
import { FlashcardEntity } from './entities/flashcard.entity';
import { FlashcardSetRepository } from './repositories/flashcard-set.repository';
import { FlashcardRepository } from './repositories/flashcard.repository';
import { FlashcardSetService } from './services/flashcard-set.service';
import { FlashcardService } from './services/flashcard.service';

@Module({
  imports: [TypeOrmModule.forFeature([FlashcardEntity, FlashcardSetEntity])],
  controllers: [FlashcardSetController, FlashCardController],
  providers: [
    FlashcardService,
    FlashcardSetService,
    FlashcardRepository,
    FlashcardSetRepository,
  ],
})
export class FlashCardModule {}
