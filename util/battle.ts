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

export function runTourneyDemo(players: Player[]) {
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

const kv = await Deno.openKv();

async function getPlayers(tourneyId: number) {
  const allQueues = kv.list<Weapon[]>({ prefix: ["attacks", tourneyId] });
  const players = [];
  for await (const queue of allQueues) {
    const player: Player = {
      name: String(queue.key[2]),
      queue: queue.value,
    };
    players.push(player);
  }
  return players;
}

export async function runTourneyKv(tourneyId: number, time: string) {
  // Get all players with queues for this tourney from KV
  let players = await getPlayers(tourneyId);

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

    // Save the results of this round to KV
    for (const result of results) {
      const p1 = result.player1;
      const p1Key = ["results", tourneyId, p1.name, round];
      await kv.set(p1Key, {
        userWeapons: p1.queue,
        opponent: result.player2?.name,
        opponentWeapons: result.player2?.queue,
      });

      if (result.player2) {
        const p2 = result.player2;
        const p2Key = ["results", tourneyId, p2.name, round];
        await kv.set(p2Key, {
          userWeapons: p2.queue,
          opponent: result.player1?.name,
          opponentWeapons: result.player1?.queue,
        });
      }
    }

    round++;
  }
  const winner = players[0];
  console.log(`Winner: ${winner.name}`);

  // Save tourney to KV
  const tourneyKey = ["tourney", tourneyId];
  const weaponStats = calcWeaponStats(roundResults);
  await kv.set(tourneyKey, {
    time,
    winner: winner.name,
    attacks: weaponStats,
  });

  return roundResults;
}

// Turn the tourney into a tree data structure
// Extract one player's journey through the tree

export function calcWeaponStats(results: Battle[][]) {
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
