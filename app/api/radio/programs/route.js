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
   REPARAR TEXTO ROTO
========================================================= */

const CP1252_TO_BYTE = new Map([
  [0x20ac, 0x80],
  [0x201a, 0x82],
  [0x0192, 0x83],
  [0x201e, 0x84],
  [0x2026, 0x85],
  [0x2020, 0x86],
  [0x2021, 0x87],
  [0x02c6, 0x88],
  [0x2030, 0x89],
  [0x0160, 0x8a],
  [0x2039, 0x8b],
  [0x0152, 0x8c],
  [0x017d, 0x8e],
  [0x2018, 0x91],
  [0x2019, 0x92],
  [0x201c, 0x93],
  [0x201d, 0x94],
  [0x2022, 0x95],
  [0x2013, 0x96],
  [0x2014, 0x97],
  [0x02dc, 0x98],
  [0x2122, 0x99],
  [0x0161, 0x9a],
  [0x203a, 0x9b],
  [0x0153, 0x9c],
  [0x017e, 0x9e],
  [0x0178, 0x9f],
]);

function badTextScore(value = "") {
  const text = String(value);

  const matches =
    text.match(
      /Ã|Â|â€|â€“|â€”|â€¦|ï¿½|�/g
    ) || [];

  return matches.length;
}

function reinterpretWindows1252AsUtf8(
  value = ""
) {
  const text = String(value);

  try {
    const bytes = [];

    for (const char of text) {
      const code =
        char.codePointAt(0);

      if (code <= 0xff) {
        bytes.push(code);
        continue;
      }

      const mapped =
        CP1252_TO_BYTE.get(
          code
        );

      if (
        mapped !==
        undefined
      ) {
        bytes.push(
          mapped
        );
        continue;
      }

      return text;
    }

    return new TextDecoder(
      "utf-8",
      {
        fatal: true,
      }
    ).decode(
      new Uint8Array(
        bytes
      )
    );
  } catch {
    return text;
  }
}

function fixMojibake(
  value = ""
) {
  let current =
    String(value);

  for (
    let attempt = 0;
    attempt < 3;
    attempt += 1
  ) {
    if (
      badTextScore(
        current
      ) === 0
    ) {
      break;
    }

    const repaired =
      reinterpretWindows1252AsUtf8(
        current
      );

    if (
      repaired ===
      current
    ) {
      break;
    }

    if (
      badTextScore(
        repaired
      ) <
      badTextScore(
        current
      )
    ) {
      current =
        repaired;
    } else {
      break;
    }
  }

  return current;
}

/* =========================================================
   XML
========================================================= */

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
        (_, number) =>
          String.fromCharCode(
            Number(number)
          )
      )
      .replace(
        /&#x([0-9a-f]+);/gi,
        (_, number) =>
          String.fromCharCode(
            parseInt(
              number,
              16
            )
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
  return fixMojibake(
    decodeEntities(
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
      .trim()
  );
}

function escapeRegex(
  value
) {
  return String(value)
    .replace(
      /[-/\\^$*+?.()|[\]{}]/g,
      "\\$&"
    );
}

function getTag(
  block,
  tag
) {
  const escaped =
    escapeRegex(tag);

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
    escapeRegex(tag);

  const escapedAttribute =
    escapeRegex(
      attribute
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

/* =========================================================
   DURACIÓN
========================================================= */

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

/* =========================================================
   FECHA
========================================================= */

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

/* =========================================================
   URL AUDIO
========================================================= */

function normalizeAudioUrl(
  value
) {
  if (!value) {
    return "";
  }

  let url =
    String(value)
      .trim();

  url =
    url.replace(
      /^http:\/\/www\.portalgameover\.com\//i,
      "https://www.portalgameover.com/"
    );

  url =
    url.replace(
      /^http:\/\/portalgameover\.com\//i,
      "https://www.portalgameover.com/"
    );

  return url;
}

/* =========================================================
   EPISODIOS
========================================================= */

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
          fixMojibake(
            stripHtml(
              getTag(
                block,
                "title"
              )
            )
          );

        const description =
          fixMojibake(
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

        const date =
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
            `${show.id}-${index}`,

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

          date,

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

    const rawXml =
      await response.text();

    const episodes =
      parseItems(
        rawXml,
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
   API
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
        new Date()
          .toISOString(),

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
