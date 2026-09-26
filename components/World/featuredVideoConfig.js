export const FEATURED_VIDEO_URL =
  "https://www.youtube.com/watch?v=M7lc1UVf-VE";

export const FEATURED_VIDEO = {
  id: "featured-video-screen",
  overlayType: "video",
  sourceType: "youtube",
  title: "VIDEO DESTACADO",
  accent: "#58f1ff",
  accent2: "#8b5cff",
  description:
    "Pantalla multimedia principal de Freaky World.",
  videoUrl: FEATURED_VIDEO_URL,
};

export function getYouTubeId(url) {
  if (!url) return null;

  try {
    const parsed = new URL(url);

    if (
      parsed.hostname.includes(
        "youtu.be"
      )
    ) {
      return parsed.pathname
        .replace("/", "")
        .split("/")[0];
    }

    if (
      parsed.pathname.startsWith(
        "/shorts/"
      )
    ) {
      return (
        parsed.pathname
          .split("/shorts/")[1]
          ?.split("/")[0] ||
        null
      );
    }

    if (
      parsed.pathname.startsWith(
        "/embed/"
      )
    ) {
      return (
        parsed.pathname
          .split("/embed/")[1]
          ?.split("/")[0] ||
        null
      );
    }

    return parsed.searchParams.get(
      "v"
    );
  } catch {
    return null;
  }
}
