import { Controller } from '@nestjs/common';
import { FlashcardService } from '../services/flashcard.service';

@Controller('flashcard')
export class FlashCardController {
  constructor(private readonly flashCardService: FlashcardService) {}
}
