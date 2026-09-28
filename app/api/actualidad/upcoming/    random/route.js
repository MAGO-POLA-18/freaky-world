import { NextResponse } from "next/server";

/* =========================================================
   TIERRA VICIO
   ACTUALIDAD · PRÓXIMOS · RANDOM V1

   OBJETIVO

   - Elegir un próximo lanzamiento al azar.
   - No descargar el catálogo completo al cliente.
   - No modificar los 10 juegos seleccionados por V4.
   - Entregar portadas adicionales para la animación
     visual de la ruleta.
========================================================= */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =========================================================
   CONFIGURACIÓN
========================================================= */

const RANDOM_POOL_SIZE = 500;
const ANIMATION_COVERS = 12;

/*
 * Buscamos dentro de un horizonte amplio.
 * Así Random sirve también para descubrir juegos
 * que todavía faltan varios meses.
 */
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
   RANDOM SEGURO
========================================================= */

function randomIndex(length) {
  if (
    !Number.isInteger(length) ||
    length <= 0
  ) {
    return 0;
  }

  /*
   * crypto está disponible en runtime Node moderno.
   *
   * No necesitamos aleatoriedad criptográfica,
   * pero evita depender de Math.random() y nos
   * da una tirada limpia por petición.
   */

  const values =
    new Uint32Array(1);

  crypto.getRandomValues(
    values
  );

  return (
    values[0] %
    length
  );
}

/* =========================================================
   BARAJAR

   Sólo se utiliza sobre el pequeño pool ya recuperado
   desde Supabase. Nunca se envía el catálogo completo
   al navegador.
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
      randomIndex(
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
   CARGAR POOL RANDOM
========================================================= */

async function loadRandomPool(
  environment
) {
  const {
    nowIso,
    futureIso,
  } =
    getFutureWindow();

  /*
   * Importante:
   *
   * Supabase devuelve como máximo 500 candidatos.
   *
   * El cliente recibe únicamente:
   *
   * - el ganador
   * - unas pocas portadas para animación
   */

  return supabaseGet(
    environment,
    [
      "games",

      "?select=",
      GAME_FIELDS,

      "&active=eq.true",

      "&first_release_date=not.is.null",

      `&first_release_date=gt.${encodeURIComponent(
        nowIso
      )}`,

      `&first_release_date=lte.${encodeURIComponent(
        futureIso
      )}`,

      "&cover_medium_url=not.is.null",

      "&order=first_release_date.asc,id.asc",

      `&limit=${RANDOM_POOL_SIZE}`,
    ].join("")
  );
}

/* =========================================================
   PORTADAS PARA LA ANIMACIÓN
========================================================= */

function createAnimationCovers(
  games,
  winnerId
) {
  const available =
    games.filter(
      (game) =>
        String(game.id) !==
          String(winnerId) &&
        (
          game.cover_medium_url ||
          game.cover_small_url ||
          game.cover_large_url
        )
    );

  const shuffled =
    shuffle(
      available
    );

  return shuffled
    .slice(
      0,
      ANIMATION_COVERS
    )
    .map(
      (game) => ({
        id:
          game.id,

        name:
          game.name,

        cover:
          game.cover_medium_url ||
          game.cover_small_url ||
          game.cover_large_url,
      })
    );
}

/* =========================================================
   GET
========================================================= */

export async function GET() {
  try {
    const environment =
      getEnvironment();

    /* =====================================================
       1 · POOL
    ===================================================== */

    const pool =
      await loadRandomPool(
        environment
      );

    if (
      pool.length === 0
    ) {
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
       2 · GANADOR
    ===================================================== */

    const winner =
      pool[
        randomIndex(
          pool.length
        )
      ];

    /* =====================================================
       3 · PORTADAS DE ANIMACIÓN
    ===================================================== */

    const animation =
      createAnimationCovers(
        pool,
        winner.id
      );

    /*
     * La última portada siempre es el ganador.
     *
     * Así el frontend puede:
     *
     * rápida → rápida → rápida → lenta → GANADOR
     */

    animation.push({
      id:
        winner.id,

      name:
        winner.name,

      cover:
        winner.cover_medium_url ||
        winner.cover_small_url ||
        winner.cover_large_url,
    });

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
          "actualidad-upcoming-random",

        generatedAt:
          new Date()
            .toISOString(),

        pool: {
          type:
            "upcoming",

          candidateCount:
            pool.length,

          horizonDays:
            MAX_FUTURE_DAYS,
        },

        animation: {
          count:
            animation.length,

          covers:
            animation,
        },

        game:
          createLightGame(
            winner
          ),
      },
      {
        status:
          200,

        /*
         * Cada pulsación debe producir una nueva tirada.
         */
        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error(
      "[Tierra Vicio / Actualidad / Upcoming Random]",
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
