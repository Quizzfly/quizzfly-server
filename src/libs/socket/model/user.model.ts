import { RoleInRoom } from '@libs/socket/enums/role-in-room.enum';

export interface UserModel {
  socketId: string;
  userId?: string;
  name: string;
  role: RoleInRoom;
  roomPin: string;
  totalScore?: number;
  answers?: Record<
    string, // questionId
    {
      questionId: string;
      chosenAnswerId: string;
      isCorrect: boolean;
      score: number;
    }
  >;
}
