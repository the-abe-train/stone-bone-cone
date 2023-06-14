import { Handlers, PageProps } from "$fresh/server.ts";
import { runTourney } from "../util/battle.ts";
import { generateFakePlayers } from "../util/fakes.ts";
import { Attack } from "../util/types.ts";

export const handler: Handlers = {
  async GET(req, ctx) {
    // Get user's queue from search params
    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.search);
    const queueParam = searchParams.get("queue");
    if (!queueParam) {
      throw "Demo failed.";
    }
    const userQueue = queueParam.split(",").map((x) => x as Attack);
    const user = { name: "You", queue: userQueue };

    // Create 15 fake players and their queues
    const fakePlayers = generateFakePlayers(15);
    const players = [...fakePlayers, user];

    // Run tournament
    const results = runTourney(players);
    // TODO need a way to only pull the results involving the user

    // Render page with data
    const resp = await ctx.render(results);
    return resp;
  },
};

export default function ({ params, data, url }: PageProps) {
  const searchParams = new URLSearchParams(url.search);
  return <div>Demo</div>;
}
