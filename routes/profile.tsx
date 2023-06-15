import { Handlers, PageProps } from "$fresh/server.ts";
import { getCookies } from "https://deno.land/std@0.179.0/http/cookie.ts";
import { getUserFromSession } from "../util/queries.ts";
import { redirectToLogin } from "../util/redirect.ts";

type Data = {
  data: string;
};

export const handler: Handlers = {
  async GET(req, ctx) {
    const user = await getUserFromSession(req.headers);
    if (!user) return redirectToLogin(req, "Error:_User_not_found.");
    console.log("User from session:", user.name);
    return ctx.render!();
  },

  async POST(req) {
    const kv = await Deno.openKv();
    const cookies = getCookies(req.headers);
    const authCookie = cookies.auth;
    const user = await getUserFromSession(req.headers);
    if (!user) return redirectToLogin(req, "Error:_User_not_found.");
    const fd = await req.formData();
    const action = fd.get("action");
    if (action === "logout") {
      await kv.delete(["sessions", authCookie]);
      return redirectToLogin(req, "Alert:_User_signed_out.");
    }
    if (action === "delete-account") {
      // TODO atomize deletes?
      await Promise.all([
        await kv.delete(["sessions", authCookie]),
        await kv.delete(["users", user.name]),
      ]);
      return redirectToLogin(req, "Alert:_Account_deleted.");
    }
    return new Response();
  },
};

export default function ({ data, url }: PageProps<Data>) {
  function deleteAccount(e: Event) {
    const answer = confirm("Are you sure you want to delete your account?");
    if (!answer) e.preventDefault();
  }
  return (
    <div>
      <h1 class="text-3xl text-center">Stone, Bone, Cone</h1>
      <h2>Profile</h2>
      <form
        action="/dashboard"
        class="inline-block w-full text-center w-40 m-12"
      >
        <button class="p-2 bg-gray-200 rounded mx-auto">Dashboard</button>
      </form>
      <form
        action=""
        method="POST"
        class="inline-block w-full text-center w-40 m-12"
      >
        <input readOnly name="action" value="logout" hidden />
        <button class="p-2 bg-gray-200 rounded mx-auto">Logout</button>
      </form>
      <form
        onSubmit={deleteAccount}
        action=""
        method="POST"
        class="inline-block w-full text-center w-40 m-12"
      >
        <input readOnly name="action" value="delete-account" hidden />
        <button class="p-2 bg-gray-200 rounded mx-auto">Delete account</button>
      </form>
    </div>
  );
}
