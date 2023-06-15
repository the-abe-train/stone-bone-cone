import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "https://deno.land/x/fresh@1.1.6/runtime.ts";
import { getUserFromSession } from "../util/queries.ts";
import { redirectToLogin } from "../util/redirect.ts";
import { User, Weapon } from "../util/types.ts";
import GameSelector from "../islands/GameSelector.tsx";
import { getNextTourney } from "../util/tourney.ts";

type Data = {
  user: User;
  nextTourneyId: number;
  nextTourneyTime: string;
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
    return ctx.render!({ user, ...nextTourney });
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
    const kv = await Deno.openKv();
    await kv.set(["users", user.name], JSON.stringify({ ...user, queue }));

    const headers = new Headers();
    headers.set("location", "/dashboard?message=locked_in");
    return new Response(null, {
      status: 303,
      headers,
    });
  },
};

export default function ({ data, url }: PageProps<Data>) {
  const { nextTourneyId, nextTourneyTime } = data;
  const last4Tourneys = [...Array(3)].map((_, i) => {
    return nextTourneyId - i - 1;
  });
  console.log(last4Tourneys);
  return (
    <>
      <Head>
        <title>Stone, Bone, Cone</title>
      </Head>
      <div className="col-span-2 space-y-8">
        <div class="flex flex-col space-y-2">
          <h2 class="text-xl">Your rankings</h2>
          {last4Tourneys.map((tourneyId) => {
            return (
              <a
                href={`/tourney/${tourneyId}`}
                class="p-2 w-2/3 bg-gray-100 rounded"
                style={{
                  fontWeight:
                    tourneyId === nextTourneyId - 1 ? "bold" : "normal",
                }}
              >
                Tourney {tourneyId}
              </a>
            );
          })}
          <a href={`/tourney/`} class="underline">
            See more...
          </a>
        </div>
        <div class="space-y-2">
          <h2 class="text-xl">Username: {data.user.name}</h2>
          <img
            src="/caveman.png"
            alt="Caveperson"
            width={150}
            class="mx-auto"
          />

          <div class="flex w-full justify-evenly">
            <form action="/demo" class="inline-block w-full space-y-2">
              <button class="p-2 bg-gray-200 rounded mx-auto block">
                Rules & Demo{" "}
              </button>
            </form>
            <form action="/profile" class="inline-block w-full">
              <button class="p-2 bg-gray-200 rounded mx-auto block">
                Profile
              </button>
            </form>
          </div>
        </div>
      </div>
      <div class="col-span-4 space-y-2 text-center">
        <h2 class="text-xl">Choose your weapons!</h2>
        <p>Set up the order of your attacks using the weapons below.</p>
        <p>
          Tourney {nextTourneyId} starts in {nextTourneyTime}.
        </p>
        <GameSelector />
        <p>92 players currently locked-in for Tourney {nextTourneyId}</p>
      </div>
    </>
  );
}
