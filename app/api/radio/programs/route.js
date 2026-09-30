const SHOWS = [
  {
    id: "game-over",
    name: "Game Over",
    badge: "GO",
    appleId: "142878483",
  },
  {
    id: "fallo-sistema",
    name: "Fallo de Sistema",
    badge: "FDS",
    appleId: "464415550",
  },
  {
    id: "pixel-perfect",
    name: "Pixel Perfect Videojuegos",
    badge: "PIX",
    appleId: "1534992747",
  },
  {
    id: "rejugando",
    name: "Rejugando",
    badge: "RE",
    appleId: "607833396",
  },
];

export const revalidate = 21600;

/* =========================================================
   HELPERS
========================================================= */

function fixMojibake(value = "") {
  const text =
    String(value);

  if (
    !/[ÃÂâ]/.test(text)
  ) {
    return text;
  }

  try {
    const bytes =
      Uint8Array.from(
        text,
        (char) =>
          char.charCodeAt(0)
      );

    return new TextDecoder(
      "utf-8"
    ).decode(bytes);
  } catch {
    return text;
  }
}

function decodeEntities(
  value = ""
) {
  const decoded =
    String(value)
      .replace(
        /<!\[CDATA\[([\s\S]*?)\]\]>/g,
        "$1"
      )
      .replace(
        /&amp;/g,
        "&"
      )
      .replace(
        /&quot;/g,
        '"'
      )
      .replace(
        /&#39;/g,
        "'"
      )
      .replace(
        /&apos;/g,
        "'"
      )
      .replace(
        /&lt;/g,
        "<"
      )
      .replace(
        /&gt;/g,
        ">"
      )
      .replace(
        /&#(\d+);/g,
        (
          _,
          number
        ) =>
          String.fromCharCode(
            Number(number)
          )
      )
      .trim();

  return fixMojibake(
    decoded
  );
}

function stripHtml(
  value = ""
) {
  return decodeEntities(
    String(value)
      .replace(
        /<br\s*\/?>/gi,
        " "
      )
      .replace(
        /<\/p>/gi,
        " "
      )
      .replace(
        /<[^>]*>/g,
        ""
      )
  )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}

function getTag(
  block,
  tag
) {
  const escaped =
    tag.replace(
      /[-/\\^$*+?.()|[\]{}]/g,
      "\\$&"
    );

  const match =
    block.match(
      new RegExp(
        `<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escaped}>`,
        "i"
      )
    );

  return match
    ? decodeEntities(
        match[1]
      )
    : "";
}

function getAttribute(
  block,
  tag,
  attribute
) {
  const escapedTag =
    tag.replace(
      /[-/\\^$*+?.()|[\]{}]/g,
      "\\$&"
    );

  const escapedAttribute =
    attribute.replace(
      /[-/\\^$*+?.()|[\]{}]/g,
      "\\$&"
    );

  const tagMatch =
    block.match(
      new RegExp(
        `<${escapedTag}\\b[^>]*>`,
        "i"
      )
    );

  if (!tagMatch) {
    return "";
  }

  const attributeMatch =
    tagMatch[0].match(
      new RegExp(
        `${escapedAttribute}\\s*=\\s*["']([^"']+)["']`,
        "i"
      )
    );

  return attributeMatch
    ? decodeEntities(
        attributeMatch[1]
      )
    : "";
}

function parseDuration(
  value
) {
  if (!value) {
    return null;
  }

  const text =
    String(value).trim();

  if (
    /^\d+$/.test(
      text
    )
  ) {
    return Number(text);
  }

  const parts =
    text
      .split(":")
      .map(Number);

  if (
    parts.some(
      (part) =>
        !Number.isFinite(
          part
        )
    )
  ) {
    return null;
  }

  if (
    parts.length === 3
  ) {
    return (
      parts[0] *
        3600 +
      parts[1] *
        60 +
      parts[2]
    );
  }

  if (
    parts.length === 2
  ) {
    return (
      parts[0] *
        60 +
      parts[1]
    );
  }

  return null;
}

function parseDate(
  value
) {
  if (!value) {
    return null;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date.toISOString();
}

function normalizeAudioUrl(
  value
) {
  if (!value) {
    return "";
  }

  let url =
    String(value).trim();

  url =
    fixMojibake(
      url
    );

  if (
    url.startsWith(
      "http://www.portalgameover.com/"
    )
  ) {
    url =
      url.replace(
        "http://www.portalgameover.com/",
        "https://www.portalgameover.com/"
      );
  }

  if (
    url.startsWith(
      "http://portalgameover.com/"
    )
  ) {
    url =
      url.replace(
        "http://portalgameover.com/",
        "https://www.portalgameover.com/"
      );
  }

  return url;
}

function parseItems(
  xml,
  show
) {
  const items =
    xml.match(
      /<item\b[\s\S]*?<\/item>/gi
    ) || [];

  return items
    .map(
      (
        block,
        index
      ) => {
        const title =
          stripHtml(
            getTag(
              block,
              "title"
            )
          );

        const description =
          stripHtml(
            getTag(
              block,
              "description"
            ) ||
              getTag(
                block,
                "content:encoded"
              ) ||
              getTag(
                block,
                "itunes:summary"
              )
          );

        const audioUrl =
          normalizeAudioUrl(
            getAttribute(
              block,
              "enclosure",
              "url"
            )
          );

        const guid =
          getTag(
            block,
            "guid"
          );

        const link =
          getTag(
            block,
            "link"
          );

        const pubDate =
          parseDate(
            getTag(
              block,
              "pubDate"
            )
          );

        const duration =
          parseDuration(
            getTag(
              block,
              "itunes:duration"
            )
          );

        if (
          !title ||
          !audioUrl
        ) {
          return null;
        }

        return {
          id:
            guid ||
            `${show.id}-${index}-${title}`,

          showId:
            show.id,

          show:
            show.name,

          badge:
            show.badge,

          title,

          description,

          audioUrl,

          link:
            link ||
            null,

          date:
            pubDate,

          duration,
        };
      }
    )
    .filter(Boolean)
    .slice(
      0,
      20
    );
}

/* =========================================================
   APPLE -> RSS
========================================================= */

async function getFeedUrl(
  appleId
) {
  const response =
    await fetch(
      `https://itunes.apple.com/lookup?id=${encodeURIComponent(
        appleId
      )}&entity=podcast&country=es`,
      {
        next: {
          revalidate:
            86400,
        },
      }
    );

  if (
    !response.ok
  ) {
    throw new Error(
      `Apple lookup ${response.status}`
    );
  }

  const data =
    await response.json();

  const podcast =
    data?.results?.find(
      (item) =>
        item.wrapperType ===
          "track" &&
        item.kind ===
          "podcast"
    ) ||
    data?.results?.[0];

  if (
    !podcast?.feedUrl
  ) {
    throw new Error(
      "RSS no encontrado"
    );
  }

  return podcast.feedUrl;
}

/* =========================================================
   CARGAR PROGRAMA
========================================================= */

async function loadShow(
  show
) {
  try {
    const feedUrl =
      await getFeedUrl(
        show.appleId
      );

    const response =
      await fetch(
        feedUrl,
        {
          headers: {
            "User-Agent":
              "TierraVicio/1.0",
          },

          next: {
            revalidate:
              21600,
          },
        }
      );

    if (
      !response.ok
    ) {
      throw new Error(
        `RSS ${response.status}`
      );
    }

    const arrayBuffer =
      await response.arrayBuffer();

    let xml;

    try {
      xml =
        new TextDecoder(
          "utf-8"
        ).decode(
          arrayBuffer
        );
    } catch {
      xml =
        new TextDecoder().decode(
          arrayBuffer
        );
    }

    const episodes =
      parseItems(
        xml,
        show
      );

    return {
      id:
        show.id,

      name:
        show.name,

      badge:
        show.badge,

      episodeCount:
        episodes.length,

      episodes,
    };
  } catch (
    error
  ) {
    console.error(
      `[Radio Tierra Vicio] ${show.name}:`,
      error
    );

    return {
      id:
        show.id,

      name:
        show.name,

      badge:
        show.badge,

      episodeCount:
        0,

      episodes:
        [],

      unavailable:
        true,
    };
  }
}

/* =========================================================
   GET
========================================================= */

export async function GET() {
  const shows =
    await Promise.all(
      SHOWS.map(
        loadShow
      )
    );

  const available =
    shows.filter(
      (show) =>
        show.episodes.length >
        0
    );

  return Response.json(
    {
      ok:
        available.length >
        0,

      generatedAt:
        new Date().toISOString(),

      refreshSeconds:
        21600,

      shows:
        available,
    },
    {
      headers: {
        "Cache-Control":
          "public, s-maxage=21600, stale-while-revalidate=86400",
      },
    }
  );
}
