import { QUEUE_LENGTH } from "./constants.ts";
import { Weapon } from "./types.ts";

function generateQueue() {
  const attacks: Weapon[] = ["stone", "bone", "cone"];
  return [...Array(QUEUE_LENGTH)].map(() => {
    return attacks[Math.floor(Math.random() * attacks.length)];
  }) as Weapon[];
}

export function generateFakePlayers(numPlayers: number) {
  return [...Array(numPlayers)].map((_, i) => {
    return {
      name: `player_${i}`,
      queue: generateQueue(),
    };
  });
}
