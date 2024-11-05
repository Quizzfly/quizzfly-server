export interface RoomSocket {
  players: Set<string>;
  locked: boolean;
}
