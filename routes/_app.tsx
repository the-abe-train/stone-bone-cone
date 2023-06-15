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
        <link rel="canonical" href="https://stonebonecone.com" />
        <meta name="description" content="A pre-historic battle royale!" />
        {/* <!-- Open Graph --> */}
        <meta property="og:title" content="Stone, Bone, Cone" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://stonebonecone.com" />
        <meta
          property="og:image"
          content="https://stonebonecone.com/opengraph.png"
        />
        <meta property="og:image:alt" content="logo" />
        <meta property="og:image:width" content="900" />
        <meta property="og:image:height" content="900" />
        <meta
          property="og:description"
          content="A pre-historic battle royale!"
        />
        <meta property="og:site_name" content="Stone, Bone, Cone" />
        {/* Favicons */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon/favicon-16x16.png"
        />
      </Head>

      <div
        class="relative top-0 bottom-0 left-0 w-screen
      right-0 min-h-screen flex flex-col justify-between items-center"
      >
        <h1 class="text-5xl text-center my-3 font-header p-2">
          Stone, Bone, Cone
        </h1>
        <div class="py-4 mx-auto max-w-screen-lg space-y-5 flex-grow">
          <main class="sm:grid grid-cols-6 md:min-w-[750px]">
            <Component />
          </main>
        </div>
        <footer class="mt-8 p-3 flex w-full justify-between max-w-screen-lg mx-atuo">
          <p>by The Abe Train</p>
          <a
            class="underline"
            href="https://github.com/the-abe-train/stone-bone-cone"
          >
            View the code on GitHub
          </a>
        </footer>
      </div>
    </>
  );
}
