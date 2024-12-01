import { Uuid } from '@common/types/common.type';
import { QuestionEntity } from '@modules/room/entities/question.entity';

export interface HostModel {
  socketId?: string;
  userId: Uuid;
  name: string;
}

export type Question = QuestionEntity & { noParticipantAnswered?: number };

export interface RoomModel {
  roomId: Uuid;
  roomPin?: string;
  quizzflyId?: string;
  questions?: Record<number, Question>;
  currentQuestionIndex?: number;
  currentQuestion?: Question;
  participants: Set<string>;
  startTime?: number;
  endTime?: number;
  locked: boolean;
  host: HostModel;
  isShowQuestion?: boolean;
  isAutoPlay?: boolean;
  lobbyMusic?: string;
}
