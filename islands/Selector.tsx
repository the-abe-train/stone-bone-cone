import { useEffect, useState } from "preact/hooks";
import { QUEUE_LENGTH } from "../util/constants.ts";

type Props = {
  queue: string[];
  setQueue: (queue: string[]) => void;
};

export default function ({ queue, setQueue }: Props) {
  const [target, setTarget] = useState(0);
  useEffect(() => {
    // If there's an empty square, set it as the target
    const emptySquare = queue.findIndex((x) => x === "nothing");
    if (emptySquare === -1) return;
    setTarget(emptySquare);
  }, [queue]);
  return (
    <div class="text-center space-y-4 max-w-screen-sm w-full">
      <div class="flex justify-around">
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
  );
}
