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

export const runtime = "nodejs";
export const revalidate = 21600;

/* =========================================================
   CODIFICACIÓN / MOJIBAKE
========================================================= */

const CP1252_REVERSE = new Map([
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

function looksBroken(value = "") {
  const text =
    String(value);

  return (
    text.includes("Ã") ||
    text.includes("Â") ||
    text.includes("â") ||
    text.includes("ðŸ") ||
    text.includes("ï¿½") ||
    text.includes("�")
  );
}

function cp1252StringToBytes(
  value
) {
  const bytes = [];

  for (
    const char of String(value)
  ) {
    const code =
      char.codePointAt(0);

    if (code <= 0xff) {
      bytes.push(code);
      continue;
    }

    const mapped =
      CP1252_REVERSE.get(
        code
      );

    if (
      mapped !== undefined
    ) {
      bytes.push(mapped);
      continue;
    }

    return null;
  }

  return Uint8Array.from(
    bytes
  );
}

function decodeBrokenUtf8Once(
  value
) {
  const text =
    String(value);

  const bytes =
    cp1252StringToBytes(
      text
    );

  if (!bytes) {
    return text;
  }

  try {
    const decoded =
      new TextDecoder(
        "utf-8",
        {
          fatal: true,
        }
      ).decode(bytes);

    return decoded;
  } catch {
    return text;
  }
}

function repairText(
  value = ""
) {
  let text =
    String(value);

  /*
    Algunos feeds pueden venir rotos
    más de una vez.

    Ejemplo:
    UTF-8 -> Windows-1252 -> UTF-8
    interpretado nuevamente de forma
    incorrecta.

    Por eso repetimos hasta 5 veces.
  */

  for (
    let attempt = 0;
    attempt < 5;
    attempt += 1
  ) {
    if (
      !looksBroken(text)
    ) {
      break;
    }

    const repaired =
      decodeBrokenUtf8Once(
        text
      );

    if (
      repaired === text
    ) {
      break;
    }

    text = repaired;
  }

  /*
    Limpieza final de casos aislados.
  */

  const replacements = [
    ["Ã¡", "á"],
    ["Ã©", "é"],
    ["Ã­", "í"],
    ["Ã³", "ó"],
    ["Ãº", "ú"],
    ["Ã±", "ñ"],
    ["Ã¼", "ü"],

    ["Ã", "Á"],
    ["Ã‰", "É"],
    ["Ã", "Í"],
    ["Ã“", "Ó"],
    ["Ãš", "Ú"],
    ["Ã‘", "Ñ"],
    ["Ãœ", "Ü"],

    ["Â¿", "¿"],
    ["Â¡", "¡"],
    ["Âº", "º"],
    ["Âª", "ª"],

    ["â€“", "–"],
    ["â€”", "—"],
    ["â€¦", "…"],
    ["â€™", "’"],
    ["â€˜", "‘"],
    ["â€œ", "“"],
    ["â€", "”"],
    ["â€¢", "•"],
    ["â„¢", "™"],
    ["â‚¬", "€"],

    ["Â ", " "],
  ];

  for (
    const [
      broken,
      correct,
    ] of replacements
  ) {
    text =
      text
        .split(broken)
        .join(correct);
  }

  return text;
}

/* =========================================================
   ENTIDADES XML / HTML
========================================================= */

function decodeEntities(
  value = ""
) {
  let text =
    String(value);

  text =
    text.replace(
      /<!\[CDATA\[([\s\S]*?)\]\]>/g,
      "$1"
    );

  /*
    Varias pasadas para casos como:
    &amp;#8211;
  */

  for (
    let i = 0;
    i < 3;
    i += 1
  ) {
    const previous =
      text;

    text =
      text
        .replace(
          /&quot;/gi,
          '"'
        )
        .replace(
          /&apos;/gi,
          "'"
        )
        .replace(
          /&#39;/gi,
          "'"
        )
        .replace(
          /&lt;/gi,
          "<"
        )
        .replace(
          /&gt;/gi,
          ">"
        )
        .replace(
          /&#x([0-9a-f]+);/gi,
          (
            _,
            hex
          ) =>
            String.fromCodePoint(
              parseInt(
                hex,
                16
              )
            )
        )
        .replace(
          /&#(\d+);/g,
          (
            _,
            number
          ) =>
            String.fromCodePoint(
              Number(number)
            )
        )
        .replace(
          /&amp;/gi,
          "&"
        );

    if (
      text === previous
    ) {
      break;
    }
  }

  return repairText(
    text
  );
}

function stripHtml(
  value = ""
) {
  const text =
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
        /<\/div>/gi,
        " "
      )
      .replace(
        /<[^>]*>/g,
        " "
      );

  return repairText(
    decodeEntities(
      text
    )
      .replace(
        /\s+/g,
        " "
      )
      .trim()
  );
}

/* =========================================================
   XML HELPERS
========================================================= */

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
    String(block).match(
      new RegExp(
        `<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escaped}>`,
        "i"
      )
    );

  if (!match) {
    return "";
  }

  return decodeEntities(
    match[1]
  );
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
    String(block).match(
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

  if (!attributeMatch) {
    return "";
  }

  return decodeEntities(
    attributeMatch[1]
  );
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
    String(value)
      .trim();

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
    parts.length === 0 ||
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

  if (
    parts.length === 1
  ) {
    return parts[0];
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
    new Date(
      value
    );

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
    repairText(
      String(value)
        .trim()
    );

  /*
    Game Over publica algunas URLs
    antiguas como HTTP.
  */

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
    String(xml).match(
      /<item\b[\s\S]*?<\/item>/gi
    ) || [];

  return items
    .map(
      (
        block,
        index
      ) => {
        const rawTitle =
          getTag(
            block,
            "title"
          );

        const rawDescription =
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
          );

        const title =
          repairText(
            stripHtml(
              rawTitle
            )
          );

        const description =
          repairText(
            stripHtml(
              rawDescription
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
          repairText(
            getTag(
              block,
              "guid"
            )
          );

        const link =
          repairText(
            getTag(
              block,
              "link"
            )
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
   FETCH
========================================================= */

function makeFetchOptions(
  forceFresh,
  revalidateSeconds,
  extra = {}
) {
  if (forceFresh) {
    return {
      ...extra,
      cache:
        "no-store",
    };
  }

  return {
    ...extra,

    next: {
      revalidate:
        revalidateSeconds,
    },
  };
}

/* =========================================================
   APPLE -> RSS
========================================================= */

async function getFeedUrl(
  appleId,
  forceFresh
) {
  const response =
    await fetch(
      `https://itunes.apple.com/lookup?id=${encodeURIComponent(
        appleId
      )}&entity=podcast&country=es`,
      makeFetchOptions(
        forceFresh,
        86400
      )
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
  show,
  forceFresh
) {
  try {
    const feedUrl =
      await getFeedUrl(
        show.appleId,
        forceFresh
      );

    const response =
      await fetch(
        feedUrl,
        makeFetchOptions(
          forceFresh,
          21600,
          {
            headers: {
              "User-Agent":
                "TierraVicio/1.0",
              Accept:
                "application/rss+xml, application/xml, text/xml, */*",
            },
          }
        )
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
   LIMPIEZA FINAL
========================================================= */

function sanitizeShow(
  show
) {
  return {
    ...show,

    name:
      repairText(
        show.name
      ),

    episodes:
      show.episodes.map(
        (episode) => ({
          ...episode,

          show:
            repairText(
              episode.show
            ),

          title:
            repairText(
              episode.title
            ),

          description:
            repairText(
              episode.description
            ),

          link:
            episode.link
              ? repairText(
                  episode.link
                )
              : null,
        })
      ),
  };
}

/* =========================================================
   API
========================================================= */

export async function GET(
  request
) {
  const url =
    new URL(
      request.url
    );

  /*
    Para probar cambios:
    ?fresh=1
    ?fresh=2
    etc.

    Cualquier parámetro "fresh"
    fuerza RSS y Apple sin caché.
  */

  const forceFresh =
    url.searchParams.has(
      "fresh"
    );

  const shows =
    await Promise.all(
      SHOWS.map(
        (show) =>
          loadShow(
            show,
            forceFresh
          )
      )
    );

  const available =
    shows
      .filter(
        (show) =>
          show.episodes.length >
          0
      )
      .map(
        sanitizeShow
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
          forceFresh
            ? "no-store, max-age=0"
            : "public, s-maxage=21600, stale-while-revalidate=86400",

        "Content-Type":
          "application/json; charset=utf-8",
      },
    }
  );
}
