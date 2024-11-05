import { RoleInRoom } from '@libs/socket/enums/role-in-room.enum';

export interface UserInSocket {
  socketId: string;
  userId?: string;
  name: string;
  role: RoleInRoom;
}
