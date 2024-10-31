
export interface UserInSocket {
  socketId: string;
  userId?: string;
  name: string;
  role: 'HOST' | 'MEMBER';
}
