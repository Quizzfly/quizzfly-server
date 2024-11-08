import { UserModel } from '@libs/socket/model/user.model';

export interface RoomModel {
  roomPin?: string;
  quizzflyId?: string;
  questions?: Record<string, any>;
  currentQuestionId?: string;
  currentQuestion?: any;
  players: Set<string>;
  startTime?: number;
  endTime?: number;
  locked: boolean;
  host: UserModel;
}
