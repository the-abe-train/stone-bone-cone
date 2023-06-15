import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "https://deno.land/x/fresh@1.1.6/runtime.ts";
import { getUserFromSession } from "../util/queries.ts";
import { redirectToLogin } from "../util/redirect.ts";
import { User, Weapon } from "../util/types.ts";
import GameSelector from "../islands/GameSelector.tsx";
import { getNextTourney, timeTilNextTourney } from "../util/tourney.ts";
import { QUEUE_LENGTH } from "../util/constants.ts";

type Data = {
  user: User;
  queue?: Weapon[];
  nextTourneyId: number;
  nextTourneyTime: string;
  lockedInCount: number;
};

export const handler: Handlers<Data> = {
  async GET(req, ctx) {
    const user = await getUserFromSession(req.headers);
    if (!user) return redirectToLogin(req, "Error:_User_not_found.");
    const nextTourney = await getNextTourney();
    if (!nextTourney)
      return new Response("Error: No tourney found", {
        status: 500,
      });

    // Get existing queue from KV
    const kv = await Deno.openKv();
    const queueRes = await kv.get(["attacks", nextTourney.id, user.name]);
    const queue = queueRes.value as Weapon[] | undefined;
    console.log(queue);

    // Get number of total locked in players
    const lockedInList = kv.list({ prefix: ["attacks", nextTourney.id] });
    let lockedInCount = 0;
    for await (const { key } of lockedInList) {
      if (key[2]) lockedInCount++;
    }

    return ctx.render!({
      user,
      queue: queue,
      nextTourneyId: nextTourney.id,
      nextTourneyTime: timeTilNextTourney(nextTourney.time),
      lockedInCount,
    });
  },

  async POST(req) {
    // Lock in the user's queue
    const user = await getUserFromSession(req.headers);
    if (!user) return redirectToLogin(req, "Error:_User_not_found.");
    const fd = await req.formData();
    const queueParam = fd.get("queue") as string;
    if (!queueParam)
      return new Response("Missing queue parameter", {
        status: 400,
      });
    const queue = queueParam.split(",").map((weapon) => weapon as Weapon);
    const nextTourney = await getNextTourney();
    if (!nextTourney)
      return new Response("Error: No tourney found", {
        status: 500,
      });
    const tourneyId = nextTourney.id;

    const kv = await Deno.openKv();
    await kv.set(["attacks", tourneyId, user.name], queue);

    const headers = new Headers();
    headers.set("location", "/dashboard?lockedin=true");
    return new Response(null, {
      status: 303,
      headers,
    });
  },
};

export default function ({ data, url }: PageProps<Data>) {
  const searchParams = new URLSearchParams(url.search);
  const { nextTourneyId, nextTourneyTime, queue, lockedInCount } = data;
  const lockedIn = searchParams.get("lockedin") === "true" || Boolean(queue);
  const last4Tourneys = [...Array(3)].map((_, i) => {
    return nextTourneyId - i - 1;
  });
  const defaultQueue = queue || [...Array(QUEUE_LENGTH)].map(() => null);

  return (
    <>
      <Head>
        <title>Stone, Bone, Cone</title>
      </Head>
      <div className="col-span-2 space-y-8">
        <div class="flex flex-col space-y-2 p-2">
          <h2 class="text-2xl" style={{ fontFamily: "Lilita One" }}>
            Rankings
          </h2>
          {last4Tourneys.map((tourneyId) => {
            const isLastTourney = tourneyId === nextTourneyId - 1;
            return (
              <a
                href={`/tourney/${tourneyId}`}
                class="p-2 w-2/3 bg-salmon rounded border hover:bg-[#FA7E61] transition-colors"
                style={{
                  fontWeight: isLastTourney ? "bold" : "normal",
                }}
              >
                Tourney {tourneyId} {isLastTourney && "(recent)"}
              </a>
            );
          })}
        </div>
        <div class="space-y-2 p-2">
          <h2 class="text-2xl" style={{ fontFamily: "Lilita One" }}>
            Username: {data.user.name}
          </h2>
          <img
            src="/caveman.png"
            alt="Caveperson"
            width={150}
            class="mx-auto"
          />

          <div class="flex w-full justify-evenly">
            <form action="/demo" class="inline-block ">
              <button
                class="p-2 bg-[#FDBEB0] rounded mx-auto text-lg shadow 
              border-black hover:bg-[#FA7E61] transition-colors"
              >
                Rules & Demo
              </button>
            </form>
            <form action="/profile" class="inline-block ">
              <button
                class="p-2 bg-[#FDBEB0] rounded mx-auto text-lg shadow 
              border-black hover:bg-[#FA7E61] transition-colors"
              >
                Profile
              </button>
            </form>
          </div>
        </div>
      </div>
      <div class="col-span-4 space-y-4 text-center">
        <h2 class="text-2xl" style={{ fontFamily: "Lilita One" }}>
          Choose your weapons!
        </h2>
        <p>Set up the order of your attacks using the weapons below.</p>
        <p>
          Tourney {nextTourneyId} starts in {nextTourneyTime}.
        </p>
        <GameSelector defaultQueue={defaultQueue} />
        <p>{lockedIn && "Your weapons are locked-in!"}</p>
        <p>
          {lockedInCount} player{lockedInCount !== 1 && "s"} currently locked-in
          for Tourney {nextTourneyId}
        </p>
      </div>
    </>
  );
}
