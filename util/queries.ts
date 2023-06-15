import { getCookies } from "cookie";
import { Session, User } from "./types.ts";

const kv = await Deno.openKv();

export async function getUserFromSession(headers: Headers) {
  const cookies = getCookies(headers);
  const authCookie = cookies.auth;
  if (!authCookie) return null;
  if (authCookie.includes("Error") || authCookie.includes("Alert")) return null;
  const session = await kv.get<Session>(["sessions", authCookie]);
  const username = session.value?.user;
  if (!username) return null;
  const user = await kv.get<User>(["users", username]);
  if (!user.value) return null;
  return user.value;
}
