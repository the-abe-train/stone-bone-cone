import { Options } from "$fresh/plugins/twind.ts";
import { apply } from "twind";

export default {
  selfURL: import.meta.url,
  preflight: (preflight) => ({
    ...preflight,
    "@import": `url('https://fonts.googleapis.com/css2?family=Lilita+One&display=swap');`,
    body: apply`bg-[#FEE1C7]`,
  }),
  theme: {
    extend: {
      colors: {
        beige: "#FEE1C7",
        orange: "#F57C00",
        salmon: "#FDBEB0",
        bass: "#FA7E61",
      },
      fontFamily: {
        header: ["Lilita One"],
      },
    },
  },
} as Options;
