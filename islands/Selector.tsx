import { useEffect, useState } from "preact/hooks";
import { QUEUE_LENGTH } from "../util/constants.ts";

export default function () {
  const [target, setTarget] = useState(0);
  const defaultQueue = [...Array(QUEUE_LENGTH)].map((_) => "nothing");
  const [queue, setQueue] = useState(defaultQueue);
  useEffect(() => {
    // If there's an empty square, set it as the target
    const emptySquare = queue.findIndex((x) => x === "nothing");
    if (emptySquare === -1) return;
    setTarget(emptySquare);
  }, [queue]);
  return (
    <div class="m-4 flex justify-around bg-gray-100 border rounded p-4">
      <div class="text-center space-y-4">
        <div class="flex space-x-6">
          {[...Array(QUEUE_LENGTH)].map((_, i) => {
            return (
              <div
                class={`p-0 bg-gray-200 border-black rounded box-border
              flex flex-col justify-center items-center w-24 h-24
               ${target === i ? "border-4" : ""}`}
                onClick={() => setTarget(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const choice = e.dataTransfer?.getData("text/plain");
                  if (!choice) return;
                  const newQueue = [...queue];
                  newQueue[i] = choice;
                  setQueue(newQueue);
                  console.log(`${choice} in slot ${i}`);
                }}
                onDragEnter={() => setTarget(i)}
                onDblClick={() => {
                  const newQueue = [...queue];
                  newQueue[i] = "nothing";
                  setQueue(newQueue);
                }}
              >
                <img
                  src={queue[i] + ".png"}
                  alt={queue[i]}
                  width={80}
                  height={80}
                  class="m-0"
                  draggable={false}
                />
              </div>
            );
          })}
        </div>
        <div class="flex justify-center space-x-6">
          {["stone", "bone", "cone"].map((x) => {
            return (
              <img
                src={`/${x}.png`}
                alt={x}
                width={90}
                onDragStart={(e) => {
                  if (e.dataTransfer) e.dataTransfer.setData("text/plain", x);
                }}
                draggable
                onClick={() => {
                  const newQueue = [...queue];
                  newQueue[target] = x;
                  setQueue(newQueue);
                }}
              />
            );
          })}
        </div>
      </div>
      <div class="w-60 text-center flex flex-col justify-center">
        <form action="/demo" class="space-y-3">
          {queue.map((x, i) => {
            return <input hidden type="text" name={String(i)} value={x} />;
          })}
          <p class="">Fill up the attack queue to play a practice game!</p>
          <button class="p-2 bg-gray-200 rounded">Play a demo</button>
        </form>
      </div>
    </div>
  );
}
