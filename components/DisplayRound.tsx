import { runBattle } from "../util/battle.ts";
import { Weapon, Player } from "../util/types.ts";

function DisplayFight({ weapons }: { weapons: { w1: Weapon; w2: Weapon }[] }) {
  return (
    <div>
      {weapons.map(({ w1, w2 }) => {
        const result = runBattle(w1, w2);
        const resultString =
          result === 1 ? "beats" : result === 0 ? "ties with" : "loses to";
        return (
          <div class="flex space-x-2 items-center">
            <img src={`${w1}.png`} alt={w1} width={50} />
            <p>{resultString}</p>
            <img src={`${w2}.png`} alt={w2} width={50} />
          </div>
        );
      })}
    </div>
  );
}

type DisplayRoundProps = {
  round: number;
  p1: Player;
  p2: Player | null;
};
export function DisplayRound({ round, p1, p2 }: DisplayRoundProps) {
  if (!p2) {
    return (
      <p>
        There were an odd number of players for Round {round}, so you had no
        opponent.
      </p>
    );
  }
  const sameWeapons: Weapon[] = [];
  for (const [i, w] of p1.queue.entries()) {
    if (w === p2.queue[i]) {
      sameWeapons.push(w);
    } else {
      break;
    }
  }
  const weapons = sameWeapons.map((w) => ({
    w1: w,
    w2: w,
  }));
  weapons.push({
    w1: p1.queue[sameWeapons.length],
    w2: p2.queue[sameWeapons.length],
  });
  if (sameWeapons.length === p1.queue.length) {
    return <p>You and {p2.name} both chose the same weapons. It's a tie!</p>;
  }

  return (
    <div>
      <p>
        {p1.name} vs. {p2.name}
      </p>
      <DisplayFight weapons={weapons} />
    </div>
  );
}
