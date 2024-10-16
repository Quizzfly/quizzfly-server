import { QuizController } from '@modules/quiz/quiz.controller';
import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';

@Module({
  controllers: [QuizController],
  providers: [QuizService],
})
export class QuizModule {}
