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

      <div class="p-4 mx-auto max-w-screen-lg space-y-5">
        <h1 class="text-3xl text-center">Stone, Bone, Cone</h1>
        <main class="grid grid-cols-6">
          <Component />
        </main>
      </div>
    </>
  );
}
