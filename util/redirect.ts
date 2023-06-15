import { setCookie } from "cookie";

export function redirectToLogin(req: Request, reason: string) {
  console.log("redirecting to login");
  const url = new URL(req.url);
  const headers = new Headers();
  setCookie(headers, {
    name: "auth",
    value: reason,
    // maxAge: 6_000_000,
    sameSite: "Lax", // this is important to prevent CSRF attacks
    domain: url.hostname,
    path: "/",
    secure: true,
  });
  headers.set("location", "/connect");
  return new Response(null, {
    status: 303,
    headers,
  });
}

export function redirectToHome() {
  const headers = new Headers();
  headers.set("location", "/");
  return new Response(null, {
    status: 303,
    headers,
  });
}

export async function newSession(req: Request, userName: string) {
  const url = new URL(req.url);
  const kv = await Deno.openKv();
  const newSessionId = crypto.randomUUID();
  await kv.set(["sessions", newSessionId], { user: userName });

  const headers = new Headers();
  setCookie(headers, {
    name: "auth",
    value: newSessionId, // this should be a unique value for each session
    // maxAge: 6_000_000,
    sameSite: "Lax", // this is important to prevent CSRF attacks
    domain: url.hostname,
    path: "/",
    secure: true,
  });
  return headers;
}
