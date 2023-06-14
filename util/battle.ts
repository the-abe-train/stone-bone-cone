import { QUEUE_LENGTH } from "./constants.ts";
import { Attack, Player } from "./types.ts";

function battle(a1: Attack, a2: Attack) {
  // 0 = tie, 1 = a1 wins, 2 = a2 wins
  const attackMap = {
    stone: { stone: 0, bone: 1, cone: 2 },
    bone: { stone: 2, bone: 0, cone: 1 },
    cone: { stone: 1, bone: 2, cone: 0 },
  };
  return attackMap[a1][a2];
}

function battleQueue(p1: Player, p2: Player) {
  for (let i = 0; i < QUEUE_LENGTH; i++) {
    const winner = battle(p1.queue[i], p2.queue[i]);
    if (winner === 1) {
      console.log(`${p1.name} beats ${p2.name} with ${p1.queue[i]}!`);
      return [p1];
    }
    if (winner === 2) {
      console.log(`${p2.name} beats ${p1.name} with ${p2.queue[i]}!`);
      return [p2];
    }
  }
  // If no winner, they both move on
  console.log(`${p1.name} and ${p2.name} tie!`);
  return [p1, p2];
}

function completeRound(players: Player[]) {
  const winners = [];
  // If there are an odd number of players, pop one from the round and add him to the winner’s array
  if (players.length % 2 === 1) {
    winners.push(players.pop()!);
  }

  // Break down players into pairs
  const pairs = [];
  const shuffledPlayers = players.sort(() => Math.random() - 0.5);
  for (let i = 0; i < shuffledPlayers.length; i += 2) {
    pairs.push([shuffledPlayers[i], shuffledPlayers[i + 1]]);
  }

  // Battle each pair
  for (const pair of pairs) {
    winners.push(...battleQueue(pair[0], pair[1]));
  }

  return winners;
}

export function runTourney(players: Player[]) {
  let round = 1;
  while (players.length > 1) {
    console.log(`Round ${round}`);
    players = completeRound(players);
    round++;
  }
  const winner = players[0];
  console.log(`Winner: ${winner.name}`);
  return winner;
}
