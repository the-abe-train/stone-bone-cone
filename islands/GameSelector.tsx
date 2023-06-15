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
    <div class="m-4 bg-gray-100 border rounded p-4">
      <Selector queue={queue} setQueue={setQueue} />
      <div class="flex space-x-4 justify-center w-full mt-8 mb-3">
        <button class="border border-black rounded p-2" onClick={resetQueue}>
          Reset
        </button>
        <form action="" method="POST">
          <input hidden type="text" name="queue" value={queue.join(",")} />
          <button
            class="p-2 bg-gray-200 rounded mx-auto"
            disabled={!queueIsFull}
          >
            Lock it in!
          </button>
        </form>
      </div>
    </div>
  );
}
