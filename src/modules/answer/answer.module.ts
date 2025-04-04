import { AnswerEntity } from '@modules/answer/entities/answer.entity';
import { AnswerRepository } from '@modules/answer/repositories/answer.repository';
import { QuizModule } from '@modules/quiz/quiz.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnswerController } from './answer.controller';
import { AnswerService } from './answer.service';

@Module({
  imports: [TypeOrmModule.forFeature([AnswerEntity]), QuizModule],
  controllers: [AnswerController],
  providers: [AnswerService, AnswerRepository],
})
export class AnswerModule {}
