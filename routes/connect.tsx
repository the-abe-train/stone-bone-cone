import * as bcrypt from "bcrypt";
import { Handlers, PageProps } from "$fresh/server.ts";
import { User } from "../util/types.ts";
import { newSession, redirectToLogin } from "../util/redirect.ts";
import { getUserFromSession } from "../util/queries.ts";
import { getCookies, deleteCookie } from "cookie";

type Data = {
  message?: string;
};

export const handler: Handlers<Data> = {
  async GET(req, ctx) {
    // If user is signed in, redirect to profile
    const user = await getUserFromSession(req.headers);
    if (user) {
      const headers = new Headers();
      headers.set("location", "/profile");
      return new Response(null, {
        status: 303,
        headers,
      });
    }

    // If not, get message stored in the cookie
    const url = new URL(req.url);
    const cookies = getCookies(req.headers);
    if (!cookies.auth) return ctx.render!();
    const messageArray = cookies.auth.split("_");
    if (messageArray[0] === "Alert:") messageArray.shift();
    const message = messageArray.join(" ");
    const resp = await ctx.render!({ message });
    deleteCookie(resp.headers, "auth", { path: "/", domain: url.hostname });
    return resp;
  },

  async POST(req) {
    // Find user by username
    const fd = await req.formData();
    const rawUsername = fd.get("username") as string;
    const rawPwd = fd.get("password") as string;

    // Set up KV
    const kv = await Deno.openKv();

    // Find user by username
    const username = rawUsername.toLowerCase().trim();
    const key = ["users", username];
    const newUser = await kv
      .atomic()
      .check({ key, versionstamp: null })
      .set(key, { name: username })
      .commit();

    if (newUser.ok) {
      console.log(`User ${username} created!`);
      // If user not found, create and return new user and new session
      const hashedPwd = bcrypt.hashSync(rawPwd);
      const newUserRes = await kv.set(key, {
        name: username,
        password: hashedPwd,
      });
      if (!newUserRes.ok) throw new Error("Failed to create user");
      const headers = await newSession(req, username);
      headers.set("location", `/dashboard`);
      return new Response(null, {
        status: 303, // "See Other"
        headers,
      });
      // Salt and hash password (salt is automatic)
    } else {
      console.log(`User ${username} already exists!`);
      // If user found, compare password hashes
      const existingUser = await kv.get<User>(key);
      if (!existingUser.versionstamp) {
        return new Response("User not found", { status: 404 });
      }
      const password = existingUser.value.password;
      const pwdMatch = bcrypt.compareSync(rawPwd, password);

      // If password matches hash, return user and new session
      if (pwdMatch) {
        console.log(`User ${username} logged in!`);
        const headers = await newSession(req, username);
        headers.set("location", `/dashboard`);
        return new Response(null, {
          status: 303, // "See Other"
          headers,
        });
      }

      // If password doesn't match, return error
      console.log("Password is NOT correct.");
      return redirectToLogin(req, "Error:_Password_is_incorrect.");
    }
  },
};

export default function ({ data, url }: PageProps<Data>) {
  return (
    <div class="m-7">
      <p class="my-2">Fill out this form to connect your account.</p>
      <form method="post" action="" class="space-y-5 flex flex-col w-80">
        <div class="space-x-2">
          <label htmlFor="username" class="w-20 inline-block">
            Username:
          </label>
          <input
            class="p-1 border"
            autofocus
            type="text"
            name="username"
            maxLength={15}
            minLength={5}
            required
          />
        </div>
        <div class="space-x-2">
          <label htmlFor="username" class="w-20 inline-block">
            Password:
          </label>
          <input
            class="p-1 border"
            type="password"
            name="password"
            minLength={5}
            maxLength={20}
            required
          />
        </div>
        <button
          class="p-3 bg-blue-100 disabled:bg-gray-100 disabled:cursor-auto
  rounded shadow hover:bg-blue-200 transition-colors duration-300
  mx-auto w-max"
          type="submit"
        >
          Submit
        </button>
      </form>
      {data?.message && <p class="my-2">{data.message}</p>}
    </div>
  );
}
