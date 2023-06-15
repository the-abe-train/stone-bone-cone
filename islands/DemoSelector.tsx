import { useState } from "preact/hooks";
import { QUEUE_LENGTH } from "../util/constants.ts";
import Selector from "./Selector.tsx";
import { Weapon } from "../util/types.ts";

export default function () {
  const defaultQueue = [...Array(QUEUE_LENGTH)].map((_) => null);
  const [queue, setQueue] = useState<(Weapon | null)[]>(defaultQueue);
  // Check if queue contains nulls
  const queueIsFull = queue.findIndex((x) => !x) === -1;
  return (
    <div
      class="m-6 flex justify-around bg-[#CAC1A9] border rounded p-4
    shadow border border-black"
    >
      <Selector queue={queue} setQueue={setQueue} />
      <div class="w-60 text-center flex flex-col justify-center">
        <form action="/tourney/demo" class="space-y-3">
          <input hidden type="text" name="queue" value={queue.join(",")} />
          <p>Fill up the attack queue to play a practice game!</p>
          <button
            class="p-2 bg-[#FDBEB0] rounded mx-auto text-lg shadow 
          font-bold border-black hover:bg-[#FA7E61] transition-colors
          disabled:opacity-50 disabled:hover:bg-[#FDBEB0]"
            disabled={!queueIsFull}
          >
            Play a demo
          </button>
        </form>
      </div>
    </div>
  );
}
