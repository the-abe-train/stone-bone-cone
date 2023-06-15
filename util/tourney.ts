import * as dt from "datetime";
import { START_DATE } from "./constants.ts";
import { Tourney } from "./types.ts";

const kv = await Deno.openKv();

export async function getNextTourney() {
  const allTourneys = kv.list<Tourney>(
    { prefix: ["tourneys"] },
    { reverse: true }
  );
  const lastTourneyIter = await allTourneys.next();
  const lastTourney = lastTourneyIter.value;
  if (!lastTourney) {
    throw new Error("No tourneys found");
  }
  const lastTourneyNumber = Number(lastTourney.key[1]) ?? 0;
  const lastTourneyTime = new Date(lastTourney.value.time);
  const nextTourneyUtc = new Date(
    Date.UTC(
      lastTourneyTime.getUTCFullYear(),
      lastTourneyTime.getUTCMonth(),
      lastTourneyTime.getUTCDate(),
      lastTourneyTime.getUTCHours() + 12
    )
  );
  const nextTourney = {
    nextTourneyId: lastTourneyNumber + 1,
    nextTourneyTime: timeTilNextTourney(nextTourneyUtc),
  };
  return nextTourney;
}

export function timeTilNextTourney(nextTime: Date) {
  const utcNow = new Date(new Date().toUTCString());
  const { minutes } = dt.difference(nextTime, utcNow, {
    units: ["minutes"],
  });
  if (!minutes) return "";
  const hoursLeft = Math.floor(minutes / 60);
  const minutesLeft = Math.floor((minutes / 60 - hoursLeft) * 60);
  const nextGameStr = `${hoursLeft}h ${minutesLeft}m`;
  return nextGameStr;
}

export function loadFakeTourneys() {
  const times = [];
  let day = START_DATE;
  const diff = () => dt.difference(day, new Date()).days ?? 0;
  while (diff() > 0) {
    day = new Date(
      Date.UTC(
        day.getUTCFullYear(),
        day.getUTCMonth(),
        day.getUTCDate(),
        day.getUTCHours() + 12
      )
    );
    const time = dt.format(day, "yyyy-MM-dd HH:mm");
    times.push(time);
  }
  const randNumber = () => Math.floor(Math.random() * 100);
  times.forEach((time, i) => {
    const tourney: Tourney = {
      time,
      winner: `player_${randNumber()}}`,
      attacks: {
        stone: randNumber(),
        bone: 0,
        cone: 0,
      },
    };
    kv.set(["tourneys", i], tourney);
  });
}

// export async function loadFakeRankings() {
//   // For the 5 most recent tourneys, load rankings for player "hammy"

//   // Get 5 most recent tourneys
//   const allTourneys = kv.list<Tourney>(
//     { prefix: ["tourneys"] },
//     { reverse: true }
//   );
//   const tourneys = [];
//   for await (const tourney of allTourneys) {
//     tourneys.push(tourney);
//     if (tourneys.length === 5) break;
//   }

//   // For each tourney,

// }
