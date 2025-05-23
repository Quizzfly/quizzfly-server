import { ParticipantModel } from '@modules/room/model/participant.model';

export function updateRank(players: Partial<ParticipantModel>[]) {
  players.sort((a, b) => b.totalScore - a.totalScore);

  players.forEach((player, index) => {
    if (index > 0 && player.totalScore === players[index - 1].totalScore) {
      player.rank = players[index - 1].rank;
    } else {
      player.rank = index + 1;
    }
  });

  return players;
}
