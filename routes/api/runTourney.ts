import { Handlers } from "$fresh/server.ts";
import { runTourneyKv } from "../../util/battle.ts";
import { getNextTourney } from "../../util/tourney.ts";

export const handler: Handlers = {
  async POST(req) {
    try {
      // Only allow requests if the API_SECRET matches
      // Secret is stored in request body
      const body = await req.json();
      if (body.secret !== Deno.env.get("API_SECRET")) {
        return new Response("Invalid secret", { status: 401 });
      }

      // Get next tourney info
      const nextTourney = await getNextTourney();
      console.log(nextTourney);
      if (!nextTourney) {
        return new Response("No tourney found", { status: 404 });
      }

      // Push tourney to KV
      await runTourneyKv(nextTourney.id, nextTourney.time.toUTCString());

      return new Response(`Successfully ran Tourney ${nextTourney.id}!`);
    } catch (e) {
      console.log(e);
      return new Response("Failed to run tourney", { status: 500 });
    }
  },
};
