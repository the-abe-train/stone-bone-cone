import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "https://deno.land/x/fresh@1.1.6/runtime.ts";
import { DisplayRound } from "../components/DisplayRound.tsx";
import { runTourney } from "../util/battle.ts";
import { FAKE_PLAYERS, WEAPONS } from "../util/constants.ts";
import { generateFakePlayers } from "../util/fakes.ts";
import { Weapon, Battle, Player } from "../util/types.ts";

export const handler: Handlers<Data> = {
  async GET(req, ctx) {
    // Get user's queue from search params
    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.search);
    const queueParam = searchParams.get("queue");
    if (!queueParam) {
      const headers = new Headers();
      headers.set("location", "/");
      return new Response(null, {
        status: 303,
        headers,
      });
    }
    const userQueue = queueParam.split(",").map((x) => x as Weapon);
    const user = { name: "You", queue: userQueue };

    // Create 15 fake players and their queues
    const fakePlayers = generateFakePlayers(FAKE_PLAYERS);
    const players = [...fakePlayers, user];

    // Run tournament
    const results = runTourney(players);

    // Pull the results involving the user
    const userMatches: Battle[] = [];
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

    // Weapons stats
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
    console.log(weaponStats);

    // Tournament stats
    const winners = results[results.length - 1][0].winner;
    const userRound = userMatches.length;
    // Losers is everyone that made it to fewer rounds than you
    // Find the number of players in each round
    const roundCounts = results.map((round) => round.length);
    console.log(roundCounts);
    // Find the number of players in the round after the user's last round
    console.log(roundCounts.slice(userRound - 1));
    const betterThanYou = roundCounts.slice(userRound - 1)[0];
    const losers = Math.max(players.length - betterThanYou, 0);

    // const losers = 0;

    const totalPlayers = players.length;

    const tourneyStats = { winners, rounds, losers, totalPlayers };

    // Render page with data
    const resp = await ctx.render({ userMatches, weaponStats, tourneyStats });
    return resp;
  },
};

type Data = {
  userMatches: Battle[];
  weaponStats: {
    stone: number;
    bone: number;
    cone: number;
  };
  tourneyStats: {
    winners: Player[];
    rounds: number;
    totalPlayers: number;
    losers: number;
  };
};

export default function ({ data, url }: PageProps<Data>) {
  const { userMatches, weaponStats, tourneyStats } = data;
  const searchParams = new URLSearchParams(url.search);
  const queueParam = searchParams.get("queue");
  const yourQueue = queueParam?.split(",").map((x) => x as Weapon);

  const winnerNames = tourneyStats.winners.map((w) => w.name).join(" and ");
  const winnerStr = winnerNames + " won the tournament!";

  const userRounds = userMatches.length;

  const roundStr = `You made it to Round ${userRounds} out of ${tourneyStats.rounds}!`;
  const loserStr = `You beat ${tourneyStats.losers} out of ${
    tourneyStats.totalPlayers - 1
  } other players!`;

  return (
    <>
      <Head>
        <title>Stone, Bone, Cone</title>
      </Head>

      <div class="col-span-3">
        {userMatches.map((match, idx) => {
          const round = idx + 1;
          const p1 = match.player1;
          const p2 = match.player2;
          return (
            <div class="flex m-2 space-x-2">
              <p class="text-lg w-24">Round {round}</p>
              <div>
                <DisplayRound round={round} p1={p1} p2={p2} />
              </div>
            </div>
          );
        })}
      </div>
      <div class="space-y-4 col-span-3">
        <div>
          <p>Your attacks</p>
          <div class="flex space-x-2">
            {yourQueue?.map((w) => (
              <img src={`/${w}.png`} alt={w} width={50} />
            ))}
          </div>
        </div>
        <form action="/" class="inline-block w-full text-center">
          <button class="p-2 bg-gray-200 rounded mx-auto">
            Pick new attacks
          </button>
        </form>
        <div>
          <p>Total weapon usage</p>
          <div class="flex space-x-5">
            {WEAPONS.map((x) => {
              return (
                <div class="flex flex-col justify-center items-center">
                  <img
                    src={`/${x}.png`}
                    alt={x}
                    width={80}
                    class="inline-block"
                  />
                  <p>{weaponStats[x]}</p>
                </div>
              );
            })}
          </div>
          <p>{winnerStr}</p>
          <p>{roundStr}</p>
          <p>{loserStr}</p>
        </div>
        <form action={url.toString()} class="inline-block w-full text-center">
          <input hidden type="text" name="queue" value={queueParam!} />
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
    </>
  );
}
