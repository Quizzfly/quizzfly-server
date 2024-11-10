import { UserModel } from '@libs/socket/model/user.model';
import { QuizEntity } from '@modules/quiz/entities/quiz.entity';
import { SlideEntity } from '@modules/slide/entity/slide.entity';

export interface QuestionType {
  type?: string;
  startTime?: number;
  done: boolean;
}

export interface CorrectAnswer {
  correctAnswerId?: string;
  choices?: Record<string, number>;
}

export type Question =
  | (QuizEntity & QuestionType & CorrectAnswer)
  | (SlideEntity & QuestionType);

export interface RoomModel {
  roomPin?: string;
  quizzflyId?: string;
  questions?: Record<string, Question>;
  currentQuestionId?: string;
  currentQuestion?: any;
  players: Set<string>;
  startTime?: number;
  endTime?: number;
  locked: boolean;
  host: UserModel;
}
