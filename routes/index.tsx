import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "https://deno.land/x/fresh@1.1.6/server.ts";
import DemoSelector from "../islands/DemoSelector.tsx";
import { getNextTourney, loadFakeTourneys } from "../util/tourney.ts";

type Data = {
  nextTourneyId: number;
  nextTourneyTime: string;
};

export const handler: Handlers<Data> = {
  async GET(req, ctx) {
    const nextTourney = await getNextTourney();
    if (!nextTourney) {
      await loadFakeTourneys();
      return new Response("Error: No tourney found", {
        status: 500,
      });
    }

    return ctx.render!({
      nextTourneyId: nextTourney.id,
      nextTourneyTime: nextTourney.time,
    });
  },
};

export default function ({ data }: PageProps<Data>) {
  const { nextTourneyId, nextTourneyTime } = data;

  return (
    <>
      <Head>
        <title>Stone, Bone, Cone</title>
      </Head>
      <div class="col-span-4 space-y-6 m-2">
        <p>
          Every 12 hours, all the cavepeople get together and have a battle
          royale!
        </p>
        <p>
          Before every battle, you must equip your cave person with their
          weapons of choice: a rock, a bone, and a cone. Rock (slow and heavy)
          beats bone, bone (agile and long) beats shell, shell (swift and sharp)
          beats rock.
        </p>
        <p>
          The battle will be a tournament, and your cave person will rotate
          between the 3 weapons in the order you provide for them. After going
          through all 6 pre-selected weapons, the order will repeat.
        </p>
        <p>
          Use this screen to practice, and when you're ready, set up your
          caveperson for the next game!{" "}
          <b>
            Tourney {nextTourneyId} starts in {nextTourneyTime}.
          </b>
          .
        </p>
      </div>
      <div class="col-span-2 px-4 space-y-4">
        <img src="/caveman.png" alt="Caveperson" width={150} class="mx-auto" />
        <form action="/connect" class="inline-block w-full text-center">
          <button
            class="p-2 bg-[#FDBEB0] rounded mx-auto text-lg shadow 
          font-bold border-black hover:bg-[#FA7E61] transition-colors"
          >
            Connect & play
          </button>
        </form>
      </div>
      <div class="col-span-6">
        <DemoSelector />
      </div>
    </>
  );
}
