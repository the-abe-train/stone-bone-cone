#!/usr/bin/env -S deno run -A --watch=static/,routes/

import dev from "$fresh/dev.ts";

Deno.env.set("MODE", "dev");

await dev(import.meta.url, "./main.ts");
