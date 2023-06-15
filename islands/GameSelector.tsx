import { useState } from "preact/hooks";
import { QUEUE_LENGTH } from "../util/constants.ts";
import Selector from "./Selector.tsx";
import { Weapon } from "../util/types.ts";

export default function ({
  defaultQueue,
}: {
  defaultQueue: (Weapon | null)[];
}) {
  const [queue, setQueue] = useState(defaultQueue);
  const emptyQueue = [...Array(QUEUE_LENGTH)].map(() => null);
  function resetQueue() {
    setQueue(emptyQueue);
  }
  const queueIsFull = queue.findIndex((x) => !x) === -1;

  return (
    <div
      class="m-4 bg-[#CAC1A9] border rounded p-4
    shadow border border-black"
    >
      <Selector queue={queue} setQueue={setQueue} />
      <div class="flex space-x-4 justify-center w-full mt-8 mb-3">
        <button
          class="p-2 rounded text-lg shadow 
          font-bold border-[#FDBEB0] border-2 hover:bg-[#FA7E61] transition-colors
          disabled:opacity-50 disabled:hover:bg-[#FDBEB0] hover:border-[#FA7E61] "
          onClick={resetQueue}
        >
          Reset
        </button>
        <form action="" method="POST">
          <input hidden type="text" name="queue" value={queue.join(",")} />
          <button
            class="p-2 bg-[#FDBEB0] rounded  text-lg shadow 
                        font-bold border-black hover:bg-[#FA7E61] transition-colors
                        disabled:opacity-50 disabled:hover:bg-[#FDBEB0]"
            disabled={!queueIsFull}
          >
            Lock it in!
          </button>
        </form>
      </div>
    </div>
  );
}
