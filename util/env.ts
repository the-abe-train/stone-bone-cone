import { load } from "dotenv";

const localEnv = await load();

Object.entries(localEnv).forEach((entry) => {
  const [key, value] = entry;
  Deno.env.set(key, value);
});

export const API_SECRET = Deno.env.get("API_SECRET") ?? "";
