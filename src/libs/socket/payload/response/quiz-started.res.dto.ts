import { PlayerInfo } from '@libs/socket/model/player.model';

export class QuizStartedResDto {
  roomPin: string;
  startTime: Date;
  players: PlayerInfo[];
}
