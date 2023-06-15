import { QUEUE_LENGTH } from "./constants.ts";
import { generateFakePlayers } from "./fakes.ts";
import { Weapon, Player, Result, Tourney, Attack } from "./types.ts";

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
  const result: Result = { player1: p1, player2: p2, winner: [] };
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
  const fights: Result[] = [];
  // If there are an odd number of players, pop one from the round and add him to the winner’s array
  if (players.length % 2 === 1) {
    const leftover = players.pop()!;
    const result: Result = {
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
  }

  return fights;
}

export function runTourneyDemo(players: Player[]) {
  let round = 1;
  const tourneyResults: Result[][] = [];
  while (players.length > 1) {
    console.log(`Round ${round}`);
    const shuffledPlayers = players.sort(() => Math.random() - 0.5);
    const results = completeRound(shuffledPlayers);
    tourneyResults.push(results);
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
  return tourneyResults;
}

const kv = await Deno.openKv();

export async function getPlayers(tourneyId: number) {
  const allQueues = kv.list<Attack>({ prefix: ["attacks", tourneyId] });
  const players = [];
  for await (const queue of allQueues) {
    const player: Player = {
      name: String(queue.key[2]),
      queue: queue.value,
    };
    players.push(player);
  }
  console.log(players);
  return players;
}

export async function runTourneyKv(tourneyId: number, time: string) {
  // Get all players with queues for this tourney from KV
  const fakePlayers = generateFakePlayers(16);
  const realPlayers = await getPlayers(tourneyId);
  const numPlayers = fakePlayers.length + realPlayers.length;
  let players = [...fakePlayers, ...realPlayers];
  console.log(`Total players: ${players.length}`);

  let round = 1;
  const tourneyResults: Result[][] = [];
  while (players.length > 1) {
    console.log(`Round ${round}`);
    const shuffledPlayers = players.sort(() => Math.random() - 0.5);
    const results = completeRound(shuffledPlayers);
    tourneyResults.push(results);
    const winners = results.map((result) => result.winner).flat();
    if (players.length === winners.length) {
      console.log("Final round tie!");
      break;
    }
    players = winners;

    // Save the results of this round to KV
    for (const result of results) {
      const p1 = result.player1;
      const p1Key = ["results", tourneyId, p1.name, round];
      const p1Result: Result = {
        player1: p1,
        player2: result.player2,
        winner: result.winner,
      };
      await kv.set(p1Key, p1Result);

      if (result.player2) {
        const p2 = result.player2;
        const p2Key = ["results", tourneyId, p2.name, round];
        const p2Result: Result = {
          player1: p2,
          player2: result.player1,
          winner: result.winner,
        };
        await kv.set(p2Key, p2Result);
      }
    }

    round++;
  }
  const winnerNames = players.map((w) => w.name).join(" and ");
  const winnerStr = winnerNames + " won the tournament!";
  console.log(`Winner: ${winnerStr}`);

  // Save tourney to KV
  const tourneyKey = ["tourneys", tourneyId];
  const weaponStats = calcWeaponStats(tourneyResults);
  const tourney: Tourney = {
    time,
    winners: players.map((p) => p.name),
    numPlayers,
    attacks: weaponStats,
    rounds: round - 1,
  };

  await kv.set(tourneyKey, tourney);

  return tourneyResults;
}

// Turn the tourney into a tree data structure
// Extract one player's journey through the tree

export function calcWeaponStats(results: Result[][]) {
  const weaponStats = {
    stone: 0,
    bone: 0,
    cone: 0,
  };
  const allRounds = results.flat();
  for (const match of allRounds) {
    for (const w of match.player1.queue) {
      weaponStats[w]++;
    }
    for (const w of match.player2?.queue ?? []) {
      weaponStats[w]++;
    }
  }
  return weaponStats;
}

export async function getTourneyResults(tourneyId: number, user: string) {
  const allResults = kv.list<Result>({ prefix: ["results", tourneyId, user] });
  const results: Result[] = [];
  for await (const result of allResults) {
    results.push(result.value);
  }
  return results;
}
