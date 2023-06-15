import { Handlers, PageProps } from "$fresh/server.ts";
import { getCookies } from "cookie";
import { getUserFromSession } from "../util/queries.ts";
import { redirectToLogin } from "../util/redirect.ts";
import { Head } from "$fresh/runtime.ts";

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
    <>
      <Head>
        <title>Connect</title>
      </Head>
      <div class="m-7 col-span-6">
        <h2 class="text-2xl font-header">Profile</h2>
        <div class="flex flex-wrap space-x-3 sm:space-x-8 p-3 justify-center">
          <form action="/dashboard" class="inline-block text-center  p-3">
            <button
              class="p-2 bg-[#FDBEB0] rounded mx-auto text-lg shadow 
              border-black hover:bg-[#FA7E61] transition-colors"
            >
              Dashboard
            </button>
          </form>
          <form action="" method="POST" class="inline-block text-center p-3">
            <input readOnly name="action" value="logout" hidden />
            <button
              class="p-2 rounded text-lg shadow 
           border-[#FDBEB0] border-2 hover:bg-[#FA7E61] transition-colors
          disabled:opacity-50 disabled:hover:bg-[#FDBEB0] hover:border-[#FA7E61] "
            >
              Logout
            </button>
          </form>
          <form
            onSubmit={deleteAccount}
            action=""
            method="POST"
            class="inline-block text-center p-3"
          >
            <input readOnly name="action" value="delete-account" hidden />
            <button
              class="p-2 rounded text-lg shadow 
           border-[#FDBEB0] border-2 hover:bg-[#FA7E61] transition-colors
          disabled:opacity-50 disabled:hover:bg-[#FDBEB0] hover:border-[#FA7E61] "
            >
              Delete account
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
