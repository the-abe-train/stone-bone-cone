import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "https://deno.land/x/fresh@1.1.6/runtime.ts";
import { runBattle, runTourney } from "../util/battle.ts";
import { FAKE_PLAYERS } from "../util/constants.ts";
import { generateFakePlayers } from "../util/fakes.ts";
import { Attack, Battle, Player } from "../util/types.ts";

export const handler: Handlers<Battle[]> = {
  async GET(req, ctx) {
    // Get user's queue from search params
    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.search);
    const queueParam = searchParams.get("queue");
    if (!queueParam) {
      throw "Demo failed.";
    }
    const userQueue = queueParam.split(",").map((x) => x as Attack);
    const user = { name: "You", queue: userQueue };

    // Create 15 fake players and their queues
    const fakePlayers = generateFakePlayers(FAKE_PLAYERS);
    const players = [...fakePlayers, user];

    // Run tournament
    const results = runTourney(players);

    // Pull the results involving the user
    const userMatches = [];
    const rounds = results.length;
    for (let i = 0; i < rounds; i++) {
      const round = results[i];
      let matchWithUser = round.find(
        (x) => x.player1.name === "You" || x.player2?.name === "You"
      );
      if (matchWithUser) {
        if (matchWithUser.player2?.name === "You") {
          const reorderBattle = {
            player1: matchWithUser.player2,
            player2: matchWithUser.player1,
            winner: matchWithUser.winner,
          };
          matchWithUser = reorderBattle;
        }
        userMatches.push(matchWithUser);
      } else {
        break;
      }
    }

    // Render page with data
    const resp = await ctx.render(userMatches);
    return resp;
  },
};

export function DisplayFight({
  weapons,
}: {
  weapons: { w1: Attack; w2: Attack }[];
}) {
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
  const sameWeapons: Attack[] = [];
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

export default function ({ params, data, url }: PageProps<Battle[]>) {
  const userMatches = data;
  const searchParams = new URLSearchParams(url.search);
  console.log(searchParams.get("queue"));

  return (
    <>
      <Head>
        <title>Stone, Bone, Cone</title>
      </Head>
      <div class="p-4 mx-auto max-w-screen-lg space-y-5">
        <h1 class="text-3xl text-center">Stone, Bone, Cone</h1>
        <main class="grid grid-cols-6">
          <div class="col-span-4">
            {userMatches.map((match, idx) => {
              const round = idx + 1;
              const p1 = match.player1;
              const p2 = match.player2;
              console.log(`Round ${round}`);
              return (
                <div class="flex m-2 space-x-2">
                  <p class="text-lg">Round {round}</p>
                  <div>
                    <DisplayRound round={round} p1={p1} p2={p2} />
                  </div>
                </div>
              );
            })}
          </div>
          <div class="space-y-4">
            <form action="/" class="inline-block w-full text-center">
              <button class="p-2 bg-gray-200 rounded mx-auto">
                Pick new attacks
              </button>
            </form>
            <form
              action={url.toString()}
              class="inline-block w-full text-center"
            >
              <input
                hidden
                type="text"
                name="queue"
                value={searchParams.get("queue")!}
              />
              <button class="p-2 bg-gray-200 rounded mx-auto">
                Re-run tournament
              </button>
            </form>
            <form action="/connect" class="inline-block w-full text-center">
              <button class="p-2 bg-gray-200 rounded mx-auto">
                Connect & play
              </button>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}
