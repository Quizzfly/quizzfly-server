import { Uuid } from '@common/types/common.type';

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
  timeLeft?: Date;
  timeKicked?: Date;
  timeJoin?: Date;
}
