import { Handlers, PageProps } from "$fresh/server.ts";
import { getUserFromSession } from "../util/queries.ts";

type Data = {
  data: string;
};

export const handler: Handlers = {
  async GET(req, ctx) {
    const user = await getUserFromSession(req.headers);
    console.log(user);
    // if (!user) return redirectToLogin(req, "Error:_User_not_found.");
    return ctx.render!();
  },
};

export default function ({ data, url }: PageProps<Data>) {
  return (
    <div>
      <h1 class="text-3xl text-center">Stone, Bone, Cone</h1>
      <h2>Dashboard</h2>
      <form action="/profile" class="inline-block w-full text-center w-40 m-12">
        <button class="p-2 bg-gray-200 rounded mx-auto">Profile</button>
      </form>
    </div>
  );
}
