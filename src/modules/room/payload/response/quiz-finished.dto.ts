import { ParticipantModel } from '@modules/room/model/participant.model';

export interface QuizFinishedDto
  extends Omit<ParticipantModel, 'timeKicked' | 'answers'> {
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  isKicked: boolean;
  totalParticipant: number;
}
