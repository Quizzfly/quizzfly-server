import { QuizEntity } from '@modules/quiz/entities/quiz.entity';
import { QuizController } from '@modules/quiz/quiz.controller';
import { QuizRepository } from '@modules/quiz/repositories/quiz.repository';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizService } from './quiz.service';

@Module({
  imports: [TypeOrmModule.forFeature([QuizEntity])],
  controllers: [QuizController],
  providers: [QuizService, QuizRepository],
})
export class QuizModule {}
