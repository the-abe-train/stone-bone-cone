#!/usr/bin/env -S deno run -A --watch=static/,routes/

import dev from "$fresh/dev.ts";
import { loadFakeTourneys } from "./util/tourney.ts";

loadFakeTourneys();

await dev(import.meta.url, "./main.ts");
