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
    <div class="m-4 flex justify-around bg-gray-100 border rounded p-4">
      <Selector queue={queue} setQueue={setQueue} />
      <div class="w-60 text-center flex flex-col justify-center">
        <form action="/tourney/demo" class="space-y-3">
          <input hidden type="text" name="queue" value={queue.join(",")} />
          <p>Fill up the attack queue to play a practice game!</p>
          <button class="p-2 bg-gray-200 rounded" disabled={!queueIsFull}>
            Play a demo
          </button>
        </form>
      </div>
    </div>
  );
}
