import { QUEUE_LENGTH } from "./constants.ts";
import { Attack } from "./types.ts";

function generateQueue() {
  const attacks: Attack[] = ["stone", "bone", "cone"];
  return [...Array(QUEUE_LENGTH)].map(() => {
    return attacks[Math.floor(Math.random() * attacks.length)];
  }) as Attack[];
}

export function generateFakePlayers(numPlayers: number) {
  return [...Array(numPlayers)].map((_, i) => {
    return {
      name: `player_${i}`,
      queue: generateQueue(),
    };
  });
}
