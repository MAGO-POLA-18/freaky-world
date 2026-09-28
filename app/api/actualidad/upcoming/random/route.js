import { NextResponse } from "next/server";
import { randomInt } from "node:crypto";

/* =========================================================
   TIERRA VICIO
   ACTUALIDAD · PRÓXIMOS · RANDOM V2

   - Sorteo sobre TODO el catálogo válido de próximos.
   - No descarga el catálogo completo.
   - 1 consulta para contar.
   - 1 consulta pequeña para obtener ganador + animación.
   - Sin caché: cada pulsación es una tirada nueva.
========================================================= */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =========================================================
   CONFIGURACIÓN
========================================================= */

const ANIMATION_COUNT = 12;
const WINDOW_SIZE = ANIMATION_COUNT + 1;
const MAX_FUTURE_DAYS = 365;

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
      supabaseUrl.replace(/\/+$/, ""),

    supabaseSecret,
  };
}

/* =========================================================
   HEADERS SUPABASE
========================================================= */

function createSupabaseHeaders(
  environment,
  extra = {}
) {
  return {
    apikey:
      environment.supabaseSecret,

    Authorization:
      `Bearer ${environment.supabaseSecret}`,

    Accept:
      "application/json",

    ...extra,
  };
}

/* =========================================================
   CAMPOS LIGEROS
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

  "hypes",

  "freaky_official_score",
  "freaky_official_votes",

  "community_score",
  "community_votes",

  "featured",
  "active",
].join(",");

/* =========================================================
   FECHAS
========================================================= */

function getFutureWindow() {
  const now =
    new Date();

  const future =
    new Date(now);

  future.setUTCDate(
    future.getUTCDate() +
      MAX_FUTURE_DAYS
  );

  return {
    nowIso:
      now.toISOString(),

    futureIso:
      future.toISOString(),
  };
}

/* =========================================================
   FILTROS COMUNES

   IMPORTANTE:
   Todavía NO filtramos DLC / ediciones / remasters
   por category o release_type.

   Primero queremos validar el Random completo.
   Ese filtro será una capa independiente después.
========================================================= */

function createFilterQuery({
  nowIso,
  futureIso,
  excludeId = null,
}) {
  const parts = [
    "active=eq.true",

    "first_release_date=not.is.null",

    `first_release_date=gt.${encodeURIComponent(
      nowIso
    )}`,

    `first_release_date=lte.${encodeURIComponent(
      futureIso
    )}`,

    "cover_medium_url=not.is.null",
  ];

  if (excludeId) {
    parts.push(
      `id=neq.${excludeId}`
    );
  }

  return parts.join("&");
}

/* =========================================================
   EXCLUDE

   Más adelante el panel puede llamar:

   /random?exclude=123

   para evitar que salga inmediatamente el mismo juego
   dos veces seguidas.
========================================================= */

function parseExcludeId(value) {
  if (!value) {
    return null;
  }

  const parsed =
    Number.parseInt(
      value,
      10
    );

  if (
    !Number.isFinite(parsed) ||
    parsed <= 0
  ) {
    return null;
  }

  return parsed;
}

/* =========================================================
   CONTAR TODO EL POOL

   Pedimos únicamente 1 ID.
   Supabase nos informa el total mediante Content-Range.

   Ejemplo:
   0-0/693

   Esto evita descargar 693 registros sólo para elegir uno.
========================================================= */

async function countUpcomingGames(
  environment,
  filters
) {
  const url =
    `${environment.supabaseUrl}` +
    `/rest/v1/games` +
    `?select=id` +
    `&${filters}` +
    `&limit=1`;

  const response =
    await fetch(
      url,
      {
        method:
          "GET",

        headers:
          createSupabaseHeaders(
            environment,
            {
              Prefer:
                "count=exact",

              Range:
                "0-0",
            }
          ),

        cache:
          "no-store",
      }
    );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `Error contando próximos: ${response.status} ${errorText}`
    );
  }

  const contentRange =
    response.headers.get(
      "content-range"
    );

  if (!contentRange) {
    throw new Error(
      "Supabase no devolvió Content-Range al contar próximos."
    );
  }

  const separatorIndex =
    contentRange.lastIndexOf("/");

  if (separatorIndex === -1) {
    throw new Error(
      `Content-Range inválido: ${contentRange}`
    );
  }

  const totalText =
    contentRange.slice(
      separatorIndex + 1
    );

  const total =
    Number.parseInt(
      totalText,
      10
    );

  if (
    !Number.isFinite(total) ||
    total < 0
  ) {
    throw new Error(
      `No se pudo interpretar el total de próximos: ${contentRange}`
    );
  }

  return total;
}

/* =========================================================
   CARGAR VENTANA PEQUEÑA

   El ganador se determina ANTES de hacer esta consulta.

   Ejemplo:

   total = 693
   posición sorteada = 421

   Traemos solamente una pequeña ventana que contiene
   la posición 421.

   Así cada posición del catálogo sigue teniendo
   posibilidad real de salir.
========================================================= */

async function loadWindow(
  environment,
  filters,
  offset,
  limit
) {
  const url =
    `${environment.supabaseUrl}` +
    `/rest/v1/games` +
    `?select=${GAME_FIELDS}` +
    `&${filters}` +
    `&order=first_release_date.asc,id.asc` +
    `&offset=${offset}` +
    `&limit=${limit}`;

  const response =
    await fetch(
      url,
      {
        method:
          "GET",

        headers:
          createSupabaseHeaders(
            environment
          ),

        cache:
          "no-store",
      }
    );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `Error cargando ventana Random: ${response.status} ${errorText}`
    );
  }

  const data =
    await response.json();

  return Array.isArray(data)
    ? data
    : [];
}

/* =========================================================
   JUEGO LIGERO
========================================================= */

function createLightGame(game) {
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

    hypes:
      game.hypes,

    freakyOfficialScore:
      game.freaky_official_score,

    freakyOfficialVotes:
      game.freaky_official_votes,

    communityScore:
      game.community_score,

    communityVotes:
      game.community_votes,

    featured:
      game.featured,

    active:
      game.active,
  };
}

/* =========================================================
   PORTADA LIGERA
========================================================= */

function createCover(game) {
  return {
    id:
      game.id,

    name:
      game.name,

    cover:
      game.cover_medium_url ||
      game.cover_small_url ||
      game.cover_large_url,
  };
}

/* =========================================================
   BARAJAR ANIMACIÓN

   Esto NO determina el ganador.
   El ganador ya fue elegido uniformemente por offset.

   Sólo cambia el orden visual de las portadas de ruleta.
========================================================= */

function shuffle(items) {
  const result =
    [...items];

  for (
    let index =
      result.length - 1;
    index > 0;
    index -= 1
  ) {
    const target =
      randomInt(
        index + 1
      );

    [
      result[index],
      result[target],
    ] = [
      result[target],
      result[index],
    ];
  }

  return result;
}

/* =========================================================
   GET
========================================================= */

export async function GET(request) {
  try {
    const environment =
      getEnvironment();

    const requestUrl =
      new URL(
        request.url
      );

    const excludeId =
      parseExcludeId(
        requestUrl.searchParams.get(
          "exclude"
        )
      );

    const {
      nowIso,
      futureIso,
    } =
      getFutureWindow();

    const filters =
      createFilterQuery({
        nowIso,
        futureIso,
        excludeId,
      });

    /* =====================================================
       1 · CONTAMOS TODO EL CATÁLOGO VÁLIDO
    ===================================================== */

    const total =
      await countUpcomingGames(
        environment,
        filters
      );

    if (total === 0) {
      return NextResponse.json(
        {
          ok:
            false,

          error:
            "No hay próximos lanzamientos disponibles para Random.",
        },
        {
          status:
            404,

          headers: {
            "Cache-Control":
              "no-store, max-age=0",
          },
        }
      );
    }

    /* =====================================================
       2 · POSICIÓN GANADORA

       randomInt(total) produce:
       0 ... total - 1
    ===================================================== */

    const winnerOffset =
      randomInt(total);

    /* =====================================================
       3 · VENTANA

       Queremos tener varias portadas alrededor del ganador
       para la animación.

       Si estamos cerca del final, movemos el inicio hacia
       atrás para seguir obteniendo hasta WINDOW_SIZE juegos.
    ===================================================== */

    const maximumWindowStart =
      Math.max(
        0,
        total - WINDOW_SIZE
      );

    const windowStart =
      Math.min(
        winnerOffset,
        maximumWindowStart
      );

    const games =
      await loadWindow(
        environment,
        filters,
        windowStart,
        Math.min(
          WINDOW_SIZE,
          total
        )
      );

    if (games.length === 0) {
      throw new Error(
        "La ventana Random quedó vacía."
      );
    }

    /* =====================================================
       4 · LOCALIZAMOS AL GANADOR REAL

       La posición ganadora es global.
       Convertimos esa posición a índice dentro
       de nuestra pequeña ventana.
    ===================================================== */

    const winnerIndex =
      winnerOffset -
      windowStart;

    const winner =
      games[winnerIndex];

    if (!winner) {
      throw new Error(
        `No se encontró el ganador Random en la posición ${winnerOffset}.`
      );
    }

    /* =====================================================
       5 · PORTADAS PARA LA RULETA

       Excluimos temporalmente al ganador.
       Lo añadimos SIEMPRE al final.

       Así la animación puede desacelerar y terminar
       exactamente sobre el juego sorteado.
    ===================================================== */

    const otherGames =
      games.filter(
        (game) =>
          String(game.id) !==
          String(winner.id)
      );

    const animationGames =
      shuffle(
        otherGames
      )
        .slice(
          0,
          ANIMATION_COUNT
        )
        .map(
          createCover
        );

    animationGames.push(
      createCover(
        winner
      )
    );

    /* =====================================================
       RESPUESTA
    ===================================================== */

    return NextResponse.json(
      {
        ok:
          true,

        source:
          "Tierra Vicio Database",

        mode:
          "actualidad-upcoming-random-v2",

        generatedAt:
          new Date()
            .toISOString(),

        pool: {
          type:
            "upcoming",

          candidateCount:
            total,

          horizonDays:
            MAX_FUTURE_DAYS,

          excludedGameId:
            excludeId,
        },

        draw: {
          winnerOffset,
          windowStart,
          windowSize:
            games.length,
        },

        animation: {
          count:
            animationGames.length,

          covers:
            animationGames,
        },

        game:
          createLightGame(
            winner
          ),
      },
      {
        status:
          200,

        headers: {
          "Cache-Control":
            "no-store, max-age=0",

          Pragma:
            "no-cache",
        },
      }
    );
  } catch (error) {
    console.error(
      "[Tierra Vicio / Actualidad / Upcoming Random V2]",
      error
    );

    return NextResponse.json(
      {
        ok:
          false,

        error:
          error instanceof Error
            ? error.message
            : "Error desconocido generando Random.",
      },
      {
        status:
          500,

        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      }
    );
  }
}
