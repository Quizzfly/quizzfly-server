import { Uuid } from '@common/types/common.type';

export type ResultAnswer = Record<
  Uuid, // questionId
  {
    questionId: string;
    chosenAnswerId: string;
    isCorrect: boolean;
    score: number;
  }
>;

export interface AnswerStatistic {
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
}

export interface ParticipantModel {
  id?: Uuid;
  socketId: string;
  userId?: Uuid;
  nickName: string;
  roomPin: string;
  totalScore?: number;
  rank?: number;
  answers?: Record<
    Uuid, // questionId
    {
      questionId: string;
      chosenAnswerId: string;
      isCorrect: boolean;
      score: number;
    }
  >;
  timeLeft?: Date | number;
  timeKicked?: Date | number;
  timeJoin?: Date | number;
}
