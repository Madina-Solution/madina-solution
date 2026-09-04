
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Madina Solution",
    short_name: "Madina Solution",
    description: "Creative Business Platform untuk desain, printing, branding, dan advertising.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#E8590C",
    lang: "id-ID",
    dir: "ltr",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
