import { NextResponse } from "next/server";

/* =========================================================
   TIERRA VICIO
   JUEGOS POR PLATAFORMA

   EJEMPLOS:

   /api/platform-games?platform=7&page=1&limit=24

   /api/platform-games
     ?platform=7
     &q=metal%20gear
     &sort=alpha
     &direction=asc
     &page=1
     &limit=24

   SORT:
   - alpha
   - score
   - year

   DIRECTION:
   - asc
   - desc

   IMPORTANTE:
   búsqueda + orden se aplican sobre TODO el catálogo
   de la plataforma y recién después se pagina.
========================================================= */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =========================================================
   CONFIG
========================================================= */

const RELATION_BATCH_SIZE = 1000;

/*
  Grupos pequeños para evitar URLs gigantes
  en PostgREST.
*/

const GAME_ID_BATCH_SIZE = 100;

/*
  Evitamos lanzar demasiadas consultas
  simultáneas a Supabase.
*/

const GAME_BATCH_CONCURRENCY = 5;

/* =========================================================
   ENTORNO
========================================================= */

function getEnvironment() {
  const supabaseUrl =
    process.env.SUPABASE_URL;

  const supabaseSecret =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "Falta SUPABASE_URL."
    );
  }

  if (!supabaseSecret) {
    throw new Error(
      "Falta SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return {
    supabaseUrl:
      supabaseUrl.replace(
        /\/+$/,
        ""
      ),

    supabaseSecret,
  };
}

/* =========================================================
   SUPABASE
========================================================= */

async function supabaseGet(
  environment,
  path
) {
  const response =
    await fetch(
      `${environment.supabaseUrl}/rest/v1/${path}`,
      {
        method: "GET",

        headers: {
          apikey:
            environment.supabaseSecret,

          Authorization:
            `Bearer ${environment.supabaseSecret}`,

          Accept:
            "application/json",
        },

        cache:
          "no-store",
      }
    );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `Supabase respondió ${response.status}: ${errorText}`
    );
  }

  return response.json();
}

/* =========================================================
   HELPERS
========================================================= */

function parsePositiveInteger(
  value,
  fallback
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return fallback;
  }

  const normalized =
    String(value).trim();

  if (!/^\d+$/.test(normalized)) {
    return fallback;
  }

  const number =
    Number(normalized);

  if (
    !Number.isSafeInteger(
      number
    ) ||
    number <= 0
  ) {
    return fallback;
  }

  return number;
}

/* =========================================================
   BÚSQUEDA
========================================================= */

function normalizeSearch(
  value
) {
  if (!value) {
    return "";
  }

  return String(value)
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 120);
}

/* =========================================================
   SORT
========================================================= */

function normalizeSort(
  value
) {
  const normalized =
    String(
      value || ""
    )
      .trim()
      .toLowerCase();

  if (
    normalized === "score" ||
    normalized === "year"
  ) {
    return normalized;
  }

  return "alpha";
}

function normalizeDirection(
  value
) {
  return String(
    value || ""
  ).toLowerCase() ===
    "desc"
    ? "desc"
    : "asc";
}

/* =========================================================
   CHUNKS
========================================================= */

function chunkArray(
  array,
  size
) {
  const chunks = [];

  for (
    let index = 0;
    index < array.length;
    index += size
  ) {
    chunks.push(
      array.slice(
        index,
        index + size
      )
    );
  }

  return chunks;
}

/* =========================================================
   CAMPOS
========================================================= */

const GAME_FIELDS = [
  "id",
  "slug",
  "name",

  "release_year",
  "first_release_date",

  "developer",
  "publisher",

  "cover_small_url",
  "cover_medium_url",
  "cover_large_url",

  "rating",
  "rating_count",

  "total_rating",
  "total_rating_count",

  "freaky_official_score",
  "freaky_official_votes",

  "community_score",
  "community_votes",

  "active",
].join(",");

/* =========================================================
   FORMATO
========================================================= */

function formatGame(
  game
) {
  return {
    id:
      game.id,

    slug:
      game.slug,

    name:
      game.name,

    year:
      game.release_year,

    releaseDate:
      game.first_release_date,

    developer:
      game.developer,

    publisher:
      game.publisher,

    cover: {
      small:
        game.cover_small_url,

      medium:
        game.cover_medium_url,

      large:
        game.cover_large_url,
    },

    /*
      También dejamos las URLs planas
      porque FullGameOverlay puede leerlas.
    */

    coverSmallUrl:
      game.cover_small_url,

    coverMediumUrl:
      game.cover_medium_url,

    coverLargeUrl:
      game.cover_large_url,

    rating:
      game.rating,

    ratingCount:
      game.rating_count,

    totalRating:
      game.total_rating,

    totalRatingCount:
      game.total_rating_count,

    freakyOfficialScore:
      game.freaky_official_score,

    freakyOfficialVotes:
      game.freaky_official_votes,

    communityScore:
      game.community_score,

    communityVotes:
      game.community_votes,
  };
}

/* =========================================================
   PUNTAJE USADO PARA ORDENAR

   Mismo criterio visual del catálogo:

   1. Freaky oficial
   2. Comunidad
   3. Total IGDB
   4. Rating IGDB
========================================================= */

function getSortableScore(
  game
) {
  const official =
    Number(
      game?.freaky_official_score
    );

  if (
    Number.isFinite(official) &&
    official > 0
  ) {
    return official;
  }

  const community =
    Number(
      game?.community_score
    );

  if (
    Number.isFinite(community) &&
    community > 0
  ) {
    return community;
  }

  const totalRating =
    Number(
      game?.total_rating
    );

  if (
    Number.isFinite(
      totalRating
    ) &&
    totalRating > 0
  ) {
    return totalRating / 10;
  }

  const rating =
    Number(
      game?.rating
    );

  if (
    Number.isFinite(rating) &&
    rating > 0
  ) {
    return rating / 10;
  }

  return null;
}

/* =========================================================
   AÑO USADO PARA ORDENAR
========================================================= */

function getSortableYear(
  game
) {
  const year =
    Number(
      game?.release_year
    );

  if (
    Number.isFinite(year) &&
    year > 0
  ) {
    return year;
  }

  if (
    game?.first_release_date
  ) {
    const date =
      new Date(
        game.first_release_date
      );

    const parsedYear =
      date.getFullYear();

    if (
      Number.isFinite(
        parsedYear
      )
    ) {
      return parsedYear;
    }
  }

  return null;
}

/* =========================================================
   ORDEN GLOBAL
========================================================= */

function sortGames(
  games,
  sort,
  direction
) {
  const multiplier =
    direction === "desc"
      ? -1
      : 1;

  return [
    ...games,
  ].sort(
    (a, b) => {
      /* ===================================================
         PUNTAJE
      =================================================== */

      if (
        sort === "score"
      ) {
        const scoreA =
          getSortableScore(a);

        const scoreB =
          getSortableScore(b);

        /*
          Los juegos sin puntuación
          siempre quedan al final,
          tanto ascendente como descendente.
        */

        if (
          scoreA === null &&
          scoreB === null
        ) {
          return compareNames(
            a,
            b
          );
        }

        if (
          scoreA === null
        ) {
          return 1;
        }

        if (
          scoreB === null
        ) {
          return -1;
        }

        if (
          scoreA !== scoreB
        ) {
          return (
            (scoreA - scoreB) *
            multiplier
          );
        }

        return compareNames(
          a,
          b
        );
      }

      /* ===================================================
         AÑO
      =================================================== */

      if (
        sort === "year"
      ) {
        const yearA =
          getSortableYear(a);

        const yearB =
          getSortableYear(b);

        /*
          Sin fecha siempre al final.
        */

        if (
          yearA === null &&
          yearB === null
        ) {
          return compareNames(
            a,
            b
          );
        }

        if (
          yearA === null
        ) {
          return 1;
        }

        if (
          yearB === null
        ) {
          return -1;
        }

        if (
          yearA !== yearB
        ) {
          return (
            (yearA - yearB) *
            multiplier
          );
        }

        return compareNames(
          a,
          b
        );
      }

      /* ===================================================
         ALFABÉTICO
      =================================================== */

      return (
        compareNames(
          a,
          b
        ) *
        multiplier
      );
    }
  );
}

function compareNames(
  a,
  b
) {
  return String(
    a?.name || ""
  ).localeCompare(
    String(
      b?.name || ""
    ),
    "es",
    {
      sensitivity:
        "base",

      numeric:
        true,
    }
  );
}

/* =========================================================
   TODOS LOS IDS DE UNA PLATAFORMA
========================================================= */

async function getAllPlatformGameIds(
  environment,
  platformId
) {
  const ids = [];

  let offset = 0;

  while (true) {
    const rows =
      await supabaseGet(
        environment,
        [
          "game_platforms",
          "?select=game_id",

          `&platform_id=eq.${platformId}`,

          "&order=game_id.asc",

          `&offset=${offset}`,

          `&limit=${RELATION_BATCH_SIZE}`,
        ].join("")
      );

    if (
      !Array.isArray(rows) ||
      rows.length === 0
    ) {
      break;
    }

    for (
      const row of rows
    ) {
      const id =
        Number(
          row?.game_id
        );

      if (
        Number.isFinite(id)
      ) {
        ids.push(id);
      }
    }

    if (
      rows.length <
      RELATION_BATCH_SIZE
    ) {
      break;
    }

    offset +=
      RELATION_BATCH_SIZE;
  }

  return [
    ...new Set(ids),
  ];
}

/* =========================================================
   CARGAR UN GRUPO DE JUEGOS
========================================================= */

async function loadGameBatch({
  environment,
  ids,
  query,
}) {
  if (
    !ids.length
  ) {
    return [];
  }

  const parts = [
    "games",
    "?select=",
    GAME_FIELDS,

    `&id=in.(${ids.join(
      ","
    )})`,

    "&active=eq.true",
  ];

  /*
    Si hay buscador, Supabase filtra por nombre
    antes de devolver el grupo.
  */

  if (query) {
    const encodedPattern =
      encodeURIComponent(
        `*${query}*`
      );

    parts.push(
      `&name=ilike.${encodedPattern}`
    );
  }

  return supabaseGet(
    environment,
    parts.join("")
  );
}

/* =========================================================
   CARGAR TODO EL CATÁLOGO DE LA PLATAFORMA

   Se descargan únicamente los juegos asociados
   a esa consola, no toda Tierra Vicio.
========================================================= */

async function loadPlatformGames({
  environment,
  platformId,
  query,
}) {
  const platformGameIds =
    await getAllPlatformGameIds(
      environment,
      platformId
    );

  if (
    platformGameIds.length ===
    0
  ) {
    return [];
  }

  const batches =
    chunkArray(
      platformGameIds,
      GAME_ID_BATCH_SIZE
    );

  const results = [];

  /*
    Procesamos grupos de hasta 5 consultas paralelas.

    Esto es bastante más rápido que hacerlas
    estrictamente una por una y evita lanzar
    todas simultáneamente.
  */

  for (
    let index = 0;
    index < batches.length;
    index += GAME_BATCH_CONCURRENCY
  ) {
    const group =
      batches.slice(
        index,
        index +
          GAME_BATCH_CONCURRENCY
      );

    const responses =
      await Promise.all(
        group.map(
          (ids) =>
            loadGameBatch({
              environment,
              ids,
              query,
            })
        )
      );

    for (
      const rows of responses
    ) {
      if (
        Array.isArray(rows) &&
        rows.length > 0
      ) {
        results.push(
          ...rows
        );
      }
    }
  }

  /* =======================================================
     DUPLICADOS
  ======================================================= */

  const uniqueById =
    new Map();

  for (
    const game of results
  ) {
    const id =
      Number(
        game?.id
      );

    if (
      Number.isFinite(id)
    ) {
      uniqueById.set(
        id,
        game
      );
    }
  }

  return [
    ...uniqueById.values(),
  ];
}

/* =========================================================
   GET
========================================================= */

export async function GET(
  request
) {
  try {
    const environment =
      getEnvironment();

    const { searchParams } =
      new URL(
        request.url
      );

    /* =====================================================
       PLATFORM ID
    ===================================================== */

    const platformId =
      parsePositiveInteger(
        searchParams.get(
          "platform"
        ),
        null
      );

    if (
      !platformId
    ) {
      return NextResponse.json(
        {
          ok: false,

          error:
            "Falta un platform ID válido.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       BÚSQUEDA
    ===================================================== */

    const query =
      normalizeSearch(
        searchParams.get(
          "q"
        )
      );

    /* =====================================================
       ORDEN
    ===================================================== */

    const sort =
      normalizeSort(
        searchParams.get(
          "sort"
        )
      );

    const direction =
      normalizeDirection(
        searchParams.get(
          "direction"
        )
      );

    /* =====================================================
       PAGINACIÓN
    ===================================================== */

    const page =
      Math.min(
        parsePositiveInteger(
          searchParams.get(
            "page"
          ),
          1
        ),
        100000
      );

    const requestedLimit =
      parsePositiveInteger(
        searchParams.get(
          "limit"
        ),
        24
      );

    const limit =
      Math.min(
        requestedLimit,
        50
      );

    const offset =
      (page - 1) *
      limit;

    /* =====================================================
       PLATAFORMA
    ===================================================== */

    const platformRows =
      await supabaseGet(
        environment,
        [
          "platforms",
          "?select=id,name,abbreviation",

          `&id=eq.${platformId}`,

          "&limit=1",
        ].join("")
      );

    if (
      !platformRows ||
      platformRows.length ===
        0
    ) {
      return NextResponse.json(
        {
          ok: false,

          found: false,

          error:
            `La plataforma ${platformId} no existe.`,
        },
        {
          status: 404,
        }
      );
    }

    const platform =
      platformRows[0];

    /* =====================================================
       CATÁLOGO COMPLETO

       1. Todos los IDs de la consola
       2. Filtrado de búsqueda si existe
       3. Orden global
       4. Paginación
    ===================================================== */

    const platformGames =
      await loadPlatformGames({
        environment,
        platformId,
        query,
      });

    const orderedGames =
      sortGames(
        platformGames,
        sort,
        direction
      );

    const totalResults =
      orderedGames.length;

    /*
      Recién acá paginamos.
    */

    const visibleGames =
      orderedGames.slice(
        offset,
        offset + limit
      );

    const formattedGames =
      visibleGames.map(
        formatGame
      );

    const hasMore =
      offset +
        formattedGames.length <
      totalResults;

    /* =====================================================
       RESPUESTA
    ===================================================== */

    return NextResponse.json(
      {
        ok: true,

        source:
          "Tierra Vicio Database",

        mode:
          query
            ? "platform-games-search"
            : "platform-games",

        query:
          query || null,

        sort,

        direction,

        platform: {
          id:
            platform.id,

          name:
            platform.name,

          abbreviation:
            platform.abbreviation,
        },

        /*
          Cantidad de esta página.
        */

        count:
          formattedGames.length,

        /*
          Cantidad total después del buscador,
          antes de paginar.
        */

        totalResults,

        games:
          formattedGames,

        pagination: {
          page,

          limit,

          returned:
            formattedGames.length,

          total:
            totalResults,

          hasMore,

          nextPage:
            hasMore
              ? page + 1
              : null,

          previousPage:
            page > 1
              ? page - 1
              : null,
        },
      },
      {
        headers: {
          "Cache-Control":
            query
              ? "public, s-maxage=60, stale-while-revalidate=300"
              : "public, s-maxage=300, stale-while-revalidate=1800",
        },
      }
    );
  } catch (error) {
    console.error(
      "[Tierra Vicio / Platform Games]",
      error
    );

    return NextResponse.json(
      {
        ok: false,

        error:
          error instanceof Error
            ? error.message
            : "Error inesperado.",
      },
      {
        status: 500,
      }
    );
  }
}
