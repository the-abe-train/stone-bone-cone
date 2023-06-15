import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { DisplayRound } from "../../components/DisplayRound.tsx";
import {
  runTourneyDemo,
  calcWeaponStats,
  getTourneyResults,
} from "../../util/battle.ts";
import { FAKE_PLAYERS, WEAPONS } from "../../util/constants.ts";
import { generateFakePlayers } from "../../util/fakes.ts";
import { getUserFromSession } from "../../util/queries.ts";
import { redirectToHome } from "../../util/redirect.ts";
import { Weapon, Result, Player, Tourney } from "../../util/types.ts";

export const handler: Handlers<Data> = {
  async GET(req, ctx) {
    // Get user's queue from search params
    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.search);
    const queueParam = searchParams.get("queue");
    const id = url.pathname.split("/")[2];
    console.log({ id });

    // Get results of matches with user
    const userMatches: Result[] = [];

    if (id === "demo") {
      if (!queueParam) return redirectToHome();
      const userQueue = queueParam.split(",").map((x) => x as Weapon);
      const user = { name: "You", queue: userQueue };

      // Create 15 fake players and their queues
      const fakePlayers = generateFakePlayers(FAKE_PLAYERS);
      const players = [...fakePlayers, user];

      // Run tournament
      const results = runTourneyDemo(players);
      // Pull the results involving the user
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
      const weaponStats = calcWeaponStats(results);

      // Tournament stats
      const winners = results[results.length - 1][0].winner.map((w) => w.name);
      const userRound = userMatches.length;
      // Losers is everyone that made it to fewer rounds than you
      // Find the number of players in each round
      const roundCounts = results.map((round) => round.length);
      console.log(roundCounts);
      // Find the number of players in the round after the user's last round
      console.log(roundCounts.slice(userRound - 1));
      const betterThanYou = roundCounts.slice(userRound - 1)[0];
      const losers = Math.max(players.length - betterThanYou, 0);

      const numPlayers = players.length;

      const tourneyStats = { winners, rounds, losers, numPlayers };

      // Render page with data
      const resp = await ctx.render({ userMatches, weaponStats, tourneyStats });
      return resp;
    } else {
      const user = await getUserFromSession(req.headers);
      if (!user) return redirectToHome();
      const tourneyId = parseInt(id);
      const results = await getTourneyResults(tourneyId, user.name);
      userMatches.push(...results);
      const kv = await Deno.openKv();
      const tourney = await kv.get<Tourney>(["tourneys", tourneyId]);
      console.log({ tourney });
      if (!tourney.value)
        return new Response("Tournament not found", { status: 404 });
      const { rounds, winners, attacks, numPlayers } = tourney.value;

      const tourneyStats = { winners, rounds, numPlayers };

      // Render page with data
      const resp = await ctx.render({
        userMatches,
        weaponStats: attacks,
        tourneyStats,
      });
      return resp;
    }
  },
};

type Data = {
  userMatches: Result[];
  weaponStats: {
    stone: number;
    bone: number;
    cone: number;
  };
  tourneyStats: {
    winners: string[];
    rounds: number;
    numPlayers: number;
    // losers: number;
  };
};

export default function ({ data, url, params }: PageProps<Data>) {
  const { userMatches, weaponStats, tourneyStats } = data;
  const searchParams = new URLSearchParams(url.search);
  const queueParam = searchParams.get("queue");
  const yourQueue = queueParam?.split(",").map((x) => x as Weapon);
  const tourneyId = parseInt(params.id);
  const isDemo = !tourneyId;
  const youParticipated = userMatches.length > 0;

  const winnerNames = tourneyStats.winners.join(" and ");
  const winnerStr = winnerNames + " won the tournament!";

  const userRounds = userMatches.length;

  const roundStr = `You made it to Round ${userRounds} out of ${tourneyStats.rounds}!`;
  // const loserStr = `You beat ${tourneyStats.losers} out of ${
  //   tourneyStats.numPlayers - 1
  // } other players!`;

  return (
    <>
      <Head>
        <title>Stone, Bone, Cone</title>
      </Head>

      <div class="col-span-3">
        {!youParticipated && (
          <p class="text-lg">You didn't battle in this tourney.</p>
        )}
        {userMatches.map((match, idx) => {
          const round = idx + 1;
          const p1 = match.player1;
          const p2 = match.player2;
          return (
            <div class="flex mx-2 my-4 space-x-2">
              <p class="text-xl w-24" style={{ fontFamily: "Lilita One" }}>
                Round {round}
              </p>
              <div class="bg-gray-100 rounded border border-black p-2 w-72">
                <DisplayRound round={round} p1={p1} p2={p2} />
              </div>
            </div>
          );
        })}
      </div>
      <div class="space-y-12 col-span-3 flex flex-col items-center">
        {youParticipated && (
          <div class="space-y-4">
            <h2 class="text-2xl" style={{ fontFamily: "Lilita One" }}>
              {" "}
              Your attacks
            </h2>
            <div class="flex space-x-2">
              {yourQueue?.map((w) => (
                <img src={`/${w}.png`} alt={w} width={50} />
              ))}
            </div>
            {isDemo && (
              <form action="/" class="inline-block w-full text-center">
                <button
                  class="p-2 bg-[#FDBEB0] rounded mx-auto text-lg shadow 
              border-black hover:bg-[#FA7E61] transition-colors"
                >
                  Pick new attacks
                </button>
              </form>
            )}
          </div>
        )}
        <div class="space-y-2 my-6">
          <h2 class="text-2xl" style={{ fontFamily: "Lilita One" }}>
            Tourney Stats
          </h2>
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
          {/* <p>{loserStr}</p> */}
        </div>
        {isDemo ? (
          <div class="space-y-4">
            <form
              action={url.toString()}
              class="inline-block w-full text-center "
            >
              <input hidden type="text" name="queue" value={queueParam!} />
              <button
                class="p-2 bg-[#FDBEB0] rounded mx-auto text-lg shadow 
          border-black hover:bg-[#FA7E61] transition-colors"
              >
                Re-run tournament
              </button>
            </form>
            <form action="/connect" class="inline-block w-full text-center">
              <button
                class="p-2 bg-[#FDBEB0] rounded mx-auto text-lg shadow 
          border-black hover:bg-[#FA7E61] transition-colors"
              >
                Connect & play
              </button>
            </form>
          </div>
        ) : (
          <div>
            <form action="/dashboard" class="inline-block w-full text-center">
              <button
                class="p-2 bg-[#FDBEB0] rounded mx-auto text-lg shadow 
          border-black hover:bg-[#FA7E61] transition-colors"
              >
                Prepare for next tourney!
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
