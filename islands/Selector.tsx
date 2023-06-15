import { useEffect, useState } from "preact/hooks";
import { QUEUE_LENGTH, WEAPONS } from "../util/constants.ts";
import { Weapon } from "../util/types.ts";

type Props = {
  queue: (Weapon | null)[];
  setQueue: (queue: (Weapon | null)[]) => void;
};

export default function ({ queue, setQueue }: Props) {
  const [target, setTarget] = useState(0);
  useEffect(() => {
    // If there's an empty square, set it as the target
    const emptySquare = queue.findIndex((x) => !x);
    if (emptySquare === -1) return;
    setTarget(emptySquare);
  }, [queue]);
  return (
    <div class="text-center space-y-4 sm:max-w-screen-sm w-full">
      <div class="flex justify-around flex-wrap sm:flex-no-wrap space-x-2">
        {[...Array(QUEUE_LENGTH)].map((_, i) => {
          return (
            <div
              class={`p-0 bg-[#FDBEB0] border-black rounded box-border
              flex flex-col justify-center items-center w-24 h-24
               ${target === i ? "border-4" : "border"}`}
              onClick={() => setTarget(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const choice = e.dataTransfer?.getData("text/plain") as Weapon;
                if (!choice) return;
                const newQueue = [...queue];
                newQueue[i] = choice;
                setQueue(newQueue);
              }}
              onDragEnter={() => setTarget(i)}
              onDblClick={() => {
                const newQueue = [...queue];
                newQueue[i] = null;
                setQueue(newQueue);
              }}
            >
              <img
                src={`${queue[i] || "nothing"}.png`}
                alt={queue[i] || "empty"}
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
        {WEAPONS.map((x) => {
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
