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
   CORRECCIÓN DE TEXTO
========================================================= */

function fixMojibake(value = "") {
  let text = String(value);

  const replacements = [
    ["\u00C3\u00A1", "á"],
    ["\u00C3\u00A9", "é"],
    ["\u00C3\u00AD", "í"],
    ["\u00C3\u00B3", "ó"],
    ["\u00C3\u00BA", "ú"],
    ["\u00C3\u00B1", "ñ"],
    ["\u00C3\u00BC", "ü"],

    ["\u00C3\u0081", "Á"],
    ["\u00C3\u0089", "É"],
    ["\u00C3\u008D", "Í"],
    ["\u00C3\u0093", "Ó"],
    ["\u00C3\u009A", "Ú"],
    ["\u00C3\u0091", "Ñ"],
    ["\u00C3\u009C", "Ü"],

    ["\u00C2\u00BF", "¿"],
    ["\u00C2\u00A1", "¡"],
    ["\u00C2\u00BA", "º"],
    ["\u00C2\u00AA", "ª"],
    ["\u00C2\u00B7", "·"],

    [
      "\u00E2\u20AC\u201C",
      "–",
    ],
    [
      "\u00E2\u20AC\u201D",
      "—",
    ],
    [
      "\u00E2\u20AC\u00A6",
      "…",
    ],
    [
      "\u00E2\u20AC\u0153",
      "“",
    ],
    [
      "\u00E2\u20AC\u009D",
      "”",
    ],
    [
      "\u00E2\u20AC\u2122",
      "’",
    ],
  ];

  for (const [
    broken,
    correct,
  ] of replacements) {
    text =
      text.split(
        broken
      ).join(
        correct
      );
  }

  // Caracteres "Â" residuales típicos
  text =
    text.replace(
      /\u00C2(?=[\s:;,.!?])/g,
      ""
    );

  return text;
}

/* =========================================================
   XML
========================================================= */

function decodeEntities(value = "") {
  return fixMojibake(
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
      .trim()
  );
}

function stripHtml(value = "") {
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

function escapeRegex(value) {
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

function parseDuration(value) {
  if (!value) {
    return null;
  }

  const text =
    String(value)
      .trim();

  if (
    /^\d+$/.test(text)
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

function parseDate(value) {
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
   URL DE AUDIO
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
   PARSEAR EPISODIOS
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

          title:
            fixMojibake(
              title
            ),

          description:
            fixMojibake(
              description
            ),

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

  if (!response.ok) {
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

    if (!response.ok) {
      throw new Error(
        `RSS ${response.status}`
      );
    }

    /*
      response.text() deja que fetch maneje
      la respuesta antes de aplicar nuestra
      corrección de mojibake.
    */

    const rawXml =
      await response.text();

    const xml =
      fixMojibake(
        rawXml
      );

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
  } catch (error) {
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
