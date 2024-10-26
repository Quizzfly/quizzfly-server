import { QuizEntity } from '@modules/quiz/entities/quiz.entity';
import { QuizController } from '@modules/quiz/quiz.controller';
import { QuizRepository } from '@modules/quiz/repositories/quiz.repository';
import { QuizzflyModule } from '@modules/quizzfly/quizzfly.module';
import { SlideModule } from '@modules/slide/slide.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizService } from './quiz.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([QuizEntity]),
    QuizzflyModule,
    forwardRef(() => SlideModule),
  ],
  controllers: [QuizController],
  providers: [QuizService, QuizRepository],
  exports: [QuizService],
})
export class QuizModule {}
