import { Head } from "$fresh/runtime.ts";
import Selector from "../islands/Selector.tsx";

// TODO replace time string with actual countdown

export default function Home() {
  return (
    <>
      <Head>
        <title>Stone, Bone, Cone</title>
      </Head>
      <div class="p-4 mx-auto max-w-screen-lg space-y-5">
        <h1 class="text-3xl text-center">Stone, Bone, Cone</h1>
        <main class="grid grid-cols-6">
          <div class="col-span-4 space-y-4">
            <p>
              Every 12 hours, all the cavepeople get together and have a battle
              royale!
            </p>
            <p>
              Before every battle, you must equip your cave person with their
              weapons of choice: a rock, a bone, and a cone. Rock (slow and
              heavy) beats bone, bone (agile and long) beats shell, shell (swift
              and sharp) beats rock.
            </p>
            <p>
              The battle will be a tournament, and your cave person will rotate
              between the 3 weapons in the order you provide for them. After
              going through all 6 pre-selected weapons, the order will repeat.
            </p>
            <p>
              Use this screen to practice, and when you're ready, set up your
              caveperson for the next game! <b>Tourney 11 starts in 3h 15m</b>.
            </p>
          </div>
          <div class="col-span-2 px-4 space-y-4">
            <img
              src="/caveman.png"
              alt="Caveperson"
              width={150}
              class="mx-auto"
            />
            <form action="/connect" class="inline-block w-full text-center">
              <button class="p-2 bg-gray-200 rounded mx-auto">
                Connect & play
              </button>
            </form>
          </div>
          <div class="col-span-6">
            <Selector />
          </div>
        </main>
      </div>
    </>
  );
}
