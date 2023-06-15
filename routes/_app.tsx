import { Head } from "$fresh/runtime.ts";
import { AppProps } from "$fresh/src/server/types.ts";

// NOTE in spite of what it says in the docs, don't put html and body tags.
// You will end up with stray (although maybe benign) tags in the page source.

export default function App({ Component }: AppProps) {
  return (
    <>
      <Head>
        {/* Metadata */}
        <meta charSet="utf-8" />
        <meta name="HandheldFriendly" content="true" />
        <meta name="MobileOptimized" content="375" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="theme-color" content="#ffffff" />
        {/* <link rel="canonical" href="https://chronogram.chat" />
        <meta
          name="description"
          content="Try to identify famous historical figures that have been recreated by AI!"
        /> */}
      </Head>

      <div
        class="relative top-0 bottom-0 left-0 w-screen
      right-0 min-h-screen flex flex-col justify-between"
      >
        <h1 class="text-5xl text-center my-3 font-header">Stone, Bone, Cone</h1>
        <div class="py-4 mx-auto max-w-screen-lg space-y-5 flex-grow">
          <main class="grid grid-cols-6 md:min-w-[750px]">
            <Component />
          </main>
        </div>
        <footer class="mt-8">
          <p>made by The Abe Train for the Deno KV Hackathon, June 15, 2023</p>
        </footer>
      </div>
    </>
  );
}
