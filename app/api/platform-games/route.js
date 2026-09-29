import { NextResponse } from "next/server";

/* =========================================================
   TIERRA VICIO
   JUEGOS POR PLATAFORMA

   Ejemplo:
   /api/platform-games?platform=7&page=1&limit=24

   Usa:
   - platforms
   - game_platforms
   - games
========================================================= */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

        cache: "no-store",
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
   CAMPOS DE JUEGO

   Mantenemos esta respuesta ligera.
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

function formatGame(game) {
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

    if (!platformId) {
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

    /*
      Pedimos uno adicional para saber
      si existe una siguiente página.
    */

    const fetchLimit =
      limit + 1;

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
      platformRows.length === 0
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
       RELACIONES GAME ↔ PLATFORM

       IMPORTANTE:
       No descargamos toda la biblioteca.
       Solo esta página de relaciones.
    ===================================================== */

    const relations =
      await supabaseGet(
        environment,
        [
          "game_platforms",
          "?select=game_id",

          `&platform_id=eq.${platformId}`,

          "&order=game_id.asc",

          `&offset=${offset}`,

          `&limit=${fetchLimit}`,
        ].join("")
      );

    const hasMore =
      relations.length >
      limit;

    const visibleRelations =
      hasMore
        ? relations.slice(
            0,
            limit
          )
        : relations;

    /* =====================================================
       SIN JUEGOS
    ===================================================== */

    if (
      visibleRelations.length ===
      0
    ) {
      return NextResponse.json(
        {
          ok: true,

          source:
            "Tierra Vicio Database",

          platform: {
            id:
              platform.id,

            name:
              platform.name,

            abbreviation:
              platform.abbreviation,
          },

          count: 0,

          games: [],

          pagination: {
            page,

            limit,

            returned: 0,

            hasMore: false,

            nextPage: null,

            previousPage:
              page > 1
                ? page - 1
                : null,
          },
        },
        {
          headers: {
            "Cache-Control":
              "public, s-maxage=300, stale-while-revalidate=1800",
          },
        }
      );
    }

    /* =====================================================
       IDS
    ===================================================== */

    const gameIds =
      visibleRelations
        .map(
          (relation) =>
            Number(
              relation.game_id
            )
        )
        .filter(
          (id) =>
            Number.isFinite(
              id
            )
        );

    /* =====================================================
       JUEGOS
    ===================================================== */

    const games =
      await supabaseGet(
        environment,
        [
          "games",
          "?select=",
          GAME_FIELDS,

          `&id=in.(${gameIds.join(
            ","
          )})`,

          "&active=eq.true",
        ].join("")
      );

    /*
      Supabase no garantiza que el resultado
      de id=in.(...) conserve el mismo orden.

      Lo reconstruimos usando el orden
      de game_platforms.
    */

    const gamesById =
      new Map(
        games.map(
          (game) => [
            Number(game.id),
            game,
          ]
        )
      );

    const orderedGames =
      gameIds
        .map(
          (id) =>
            gamesById.get(
              id
            )
        )
        .filter(Boolean)
        .map(formatGame);

    /* =====================================================
       RESPUESTA
    ===================================================== */

    return NextResponse.json(
      {
        ok: true,

        source:
          "Tierra Vicio Database",

        mode:
          "platform-games",

        platform: {
          id:
            platform.id,

          name:
            platform.name,

          abbreviation:
            platform.abbreviation,
        },

        count:
          orderedGames.length,

        games:
          orderedGames,

        pagination: {
          page,

          limit,

          returned:
            orderedGames.length,

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
            "public, s-maxage=300, stale-while-revalidate=1800",
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
