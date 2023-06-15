import { useState } from "preact/hooks";
import { QUEUE_LENGTH } from "../util/constants.ts";
import Selector from "./Selector.tsx";

export default function () {
  const defaultQueue = [...Array(QUEUE_LENGTH)].map((_) => "nothing");
  const [queue, setQueue] = useState(defaultQueue);
  return (
    <div class="m-4 flex justify-around bg-gray-100 border rounded p-4">
      <Selector queue={queue} setQueue={setQueue} />
      <div class="w-60 text-center flex flex-col justify-center">
        <form action="/demo" class="space-y-3">
          <input hidden type="text" name="queue" value={queue.join(",")} />
          <p>Fill up the attack queue to play a practice game!</p>
          <button
            class="p-2 bg-gray-200 rounded"
            disabled={queue.includes("nothing")}
          >
            Play a demo
          </button>
        </form>
      </div>
    </div>
  );
}
