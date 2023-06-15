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
  const nextTourneyUtc = getNextTime();
  if (!lastTourney)
    return {
      id: 0,
      time: nextTourneyUtc,
    };
  const lastTourneyNumber = Number(lastTourney.key[1]) ?? 0;
  const nextTourney = {
    id: lastTourneyNumber + 1,
    time: nextTourneyUtc,
  };
  return nextTourney;
}

// Function that returns the next hour in UTC
function getNextTime() {
  const nextTime = new Date(
    Date.UTC(
      new Date().getUTCFullYear(),
      new Date().getUTCMonth(),
      new Date().getUTCDate(),
      new Date().getUTCHours() + 1
    )
  );
  return nextTime;
}

export function timeTilNextTourney(nextTime: Date) {
  const utcNow = new Date(new Date().toUTCString());
  const { minutes } = dt.difference(nextTime, utcNow, {
    units: ["minutes"],
  });
  if (!minutes) return "";
  const hoursLeft = Math.floor(minutes / 60);
  const minutesLeft = Math.floor((minutes / 60 - hoursLeft) * 60);
  const nextGameStr = `${minutesLeft} minutes`;
  return nextGameStr;
}

export async function loadFakeTourneys() {
  // Delete all existing tourneys
  const allTourneys = kv.list<Tourney>({ prefix: ["tourneys"] });
  for await (const tourney of allTourneys) {
    await kv.delete(tourney.key);
  }

  console.log("Adding fake tourneys");

  const times = [];
  let day = START_DATE;
  const diff = () => {
    const o = dt.difference(day, new Date());
    return o.hours || 0;
  };
  while (diff() >= 12 && times.length < 50) {
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
  const rounds = 4;
  const players = 2 ^ rounds;
  const randNumber = () => Math.floor(Math.random() * 100);
  times.forEach(async (time, i) => {
    const tourney: Tourney = {
      time,
      winners: [`player_${randNumber()}`],
      numPlayers: players,
      attacks: {
        stone: randNumber(),
        bone: randNumber(),
        cone: randNumber(),
      },
      rounds,
    };
    console.log(`Adding tourney ${i}`);
    await kv.set(["tourneys", i], tourney);
  });
}
