import { QUEUE_LENGTH } from "./constants.ts";
import { Weapon, Battle, Player } from "./types.ts";

export function runBattle(a1: Weapon, a2: Weapon) {
  // 0 = tie, 1 = a1 wins, 2 = a2 wins
  const attackMap = {
    stone: { stone: 0, bone: 1, cone: 2 },
    bone: { stone: 2, bone: 0, cone: 1 },
    cone: { stone: 1, bone: 2, cone: 0 },
  };
  return attackMap[a1][a2];
}

function battleQueue(p1: Player, p2: Player) {
  const result: Battle = { player1: p1, player2: p2, winner: [] };
  for (let i = 0; i < QUEUE_LENGTH; i++) {
    const winner = runBattle(p1.queue[i], p2.queue[i]);
    if (winner === 1) {
      console.log(`${p1.name} beats ${p2.name} with ${p1.queue[i]}!`);
      result.winner.push(p1);
      return result;
    } else if (winner === 2) {
      console.log(`${p2.name} beats ${p1.name} with ${p2.queue[i]}!`);
      result.winner.push(p2);
      return result;
    }
  }
  // If no winner, they both move on
  console.log(`${p1.name} and ${p2.name} tie!`);
  result.winner.push(p1, p2);
  return result;
}

function completeRound(players: Player[]) {
  // const winners = [];
  const fights: Battle[] = [];
  // If there are an odd number of players, pop one from the round and add him to the winner’s array
  if (players.length % 2 === 1) {
    const leftover = players.pop()!;
    const result: Battle = {
      player1: leftover,
      player2: null,
      winner: [leftover],
    };
    // winners.push(players.pop()!);
    fights.push(result);
  }

  // Break down players into pairs
  const pairs = [];
  const shuffledPlayers = players.sort(() => Math.random() - 0.5);
  for (let i = 0; i < shuffledPlayers.length; i += 2) {
    pairs.push([shuffledPlayers[i], shuffledPlayers[i + 1]]);
  }

  // Battle each pair
  for (const pair of pairs) {
    const result = battleQueue(pair[0], pair[1]);
    fights.push(result);
    // const winner = result.winner
    // winners.push(...winner);
  }

  return fights;
}

// TODO if the last 2 players tie, you get an infinite loop
export function runTourney(players: Player[]) {
  let round = 1;
  const roundResults = [];
  while (players.length > 1) {
    console.log(`Round ${round}`);
    const shuffledPlayers = players.sort(() => Math.random() - 0.5);
    const results = completeRound(shuffledPlayers);
    roundResults.push(results);
    const winners = results.map((result) => result.winner).flat();
    if (players.length === winners.length) {
      console.log("Final round tie!");
      break;
    }
    players = winners;
    round++;
  }
  const winner = players[0];
  console.log(`Winner: ${winner.name}`);
  return roundResults;
}

// Turn the tourney into a tree data structure
// Extract one player's journey through the tree
