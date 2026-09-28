import { NextResponse } from "next/server";

/* =========================================================
   TIERRA VICIO
   MOTOR DIARIO · PRÓXIMOS LANZAMIENTOS
========================================================= */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =========================================================
   CONFIG
========================================================= */

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 20;

/*
 * Ventana de candidatos.
 *
 * No necesitamos analizar toda la biblioteca.
 * Tomamos próximos lanzamientos suficientes para construir
 * una selección diaria variada.
 */

const CANDIDATE_LIMIT = 160;

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
        method:
          "GET",

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

  const number =
    Number(value);

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

function clamp(
  value,
  min,
  max
) {
  return Math.min(
    Math.max(
      value,
      min
    ),
    max
  );
}

function numberOrZero(
  value
) {
  const number =
    Number(value);

  return Number.isFinite(
    number
  )
    ? number
    : 0;
}

/* =========================================================
   DÍA ACTUAL

   La selección cambia una vez por día.

   No usamos Math.random() porque queremos que todos los
   usuarios vean la misma Tierra Vicio durante ese día.
========================================================= */

function getDayKey() {
  return new Date()
    .toISOString()
    .slice(
      0,
      10
    );
}

/* =========================================================
   ROTACIÓN DETERMINISTA

   Mismo juego + mismo día = mismo valor.

   Mañana cambia.

   Esto permite rotación sin que la pared cambie cada vez
   que alguien recarga la página.
========================================================= */

function dailyRotation(
  gameId,
  dayKey
) {
  const input =
    `${dayKey}:${gameId}`;

  let hash =
    2166136261;

  for (
    let index = 0;
    index < input.length;
    index += 1
  ) {
    hash ^=
      input.charCodeAt(
        index
      );

    hash =
      Math.imul(
        hash,
        16777619
      );
  }

  return (
    (hash >>> 0) %
    10000
  ) / 10000;
}

/* =========================================================
   DÍAS HASTA LANZAMIENTO
========================================================= */

function getDaysUntilRelease(
  releaseDate
) {
  if (!releaseDate) {
    return Infinity;
  }

  const release =
    new Date(
      releaseDate
    );

  if (
    Number.isNaN(
      release.getTime()
    )
  ) {
    return Infinity;
  }

  const now =
    new Date();

  const todayUtc =
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    );

  const releaseUtc =
    Date.UTC(
      release.getUTCFullYear(),
      release.getUTCMonth(),
      release.getUTCDate()
    );

  return Math.max(
    0,
    Math.round(
      (
        releaseUtc -
        todayUtc
      ) /
        86400000
    )
  );
}

/* =========================================================
   PUNTUACIÓN DE CERCANÍA
========================================================= */

function getProximityScore(
  days
) {
  if (days <= 1) {
    return 100;
  }

  if (days <= 3) {
    return 96;
  }

  if (days <= 7) {
    return 90;
  }

  if (days <= 14) {
    return 80;
  }

  if (days <= 30) {
    return 68;
  }

  if (days <= 60) {
    return 54;
  }

  if (days <= 90) {
    return 42;
  }

  if (days <= 180) {
    return 28;
  }

  if (days <= 365) {
    return 16;
  }

  return 6;
}

/* =========================================================
   FORMATO DE JUEGO
========================================================= */

function createLightGame(
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
   CAMPOS NECESARIOS

   No cargamos fichas completas.
========================================================= */

const CANDIDATE_FIELDS = [
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
   CARGAR CANDIDATOS
========================================================= */

async function loadCandidates(
  environment
) {
  const nowIso =
    new Date()
      .toISOString();

  return supabaseGet(
    environment,
    [
      "games",
      "?select=",
      CANDIDATE_FIELDS,

      "&active=eq.true",

      "&first_release_date=not.is.null",

      `&first_release_date=gt.${encodeURIComponent(
        nowIso
      )}`,

      "&order=first_release_date.asc,id.asc",

      `&limit=${CANDIDATE_LIMIT}`,
    ].join("")
  );
}

/* =========================================================
   NORMALIZAR HYPE

   log1p evita que un juego gigantesco destruya por completo
   la clasificación.

   Ejemplo conceptual:

   1 hype      -> pequeño
   20 hypes    -> relevante
   500 hypes   -> muy relevante

   pero 500 no vale 500 veces más que 1.
========================================================= */

function createHypeNormalizer(
  candidates
) {
  const maximum =
    Math.max(
      1,
      ...candidates.map(
        (game) =>
          numberOrZero(
            game.hypes
          )
      )
    );

  const maximumLog =
    Math.log1p(
      maximum
    );

  return function normalizeHype(
    value
  ) {
    const hype =
      Math.max(
        0,
        numberOrZero(
          value
        )
      );

    if (
      maximumLog <= 0
    ) {
      return 0;
    }

    return (
      Math.log1p(
        hype
      ) /
      maximumLog
    ) * 100;
  };
}

/* =========================================================
   SEÑAL DE ATENCIÓN

   Para juegos todavía no lanzados, IGDB puede tener:

   - hypes
   - rating count / total rating count en algunos casos
   - featured editorial propio

   Hype sigue siendo la señal principal.
========================================================= */

function getAttentionScore(
  game,
  normalizeHype
) {
  const hypeScore =
    normalizeHype(
      game.hypes
    );

  const ratingCount =
    numberOrZero(
      game.total_rating_count
    ) +
    numberOrZero(
      game.rating_count
    );

  const ratingSignal =
    clamp(
      Math.log1p(
        ratingCount
      ) * 7,
      0,
      35
    );

  const featuredBoost =
    game.featured === true
      ? 8
      : 0;

  return clamp(
    hypeScore * 0.88 +
      ratingSignal * 0.12 +
      featuredBoost,
    0,
    108
  );
}

/* =========================================================
   SCORING

   IMPORTANTE:

   La rotación pesa poco.

   No puede sacar un lanzamiento claramente importante.

   Sólo ayuda a desempatar candidatos relativamente
   equivalentes.
========================================================= */

function scoreCandidates(
  candidates,
  dayKey
) {
  const normalizeHype =
    createHypeNormalizer(
      candidates
    );

  return candidates
    .map(
      (game) => {
        const daysUntilRelease =
          getDaysUntilRelease(
            game.first_release_date
          );

        const proximityScore =
          getProximityScore(
            daysUntilRelease
          );

        const attentionScore =
          getAttentionScore(
            game,
            normalizeHype
          );

        const rotation =
          dailyRotation(
            game.id,
            dayKey
          );

        /*
         * Base principal:
         *
         * 58% atención/hype
         * 39% cercanía
         * 3% rotación
         *
         * Para lanzamientos inminentes damos además
         * un pequeño impulso.
         */

        let launchBoost =
          0;

        if (
          daysUntilRelease <= 1
        ) {
          launchBoost =
            12;
        } else if (
          daysUntilRelease <= 3
        ) {
          launchBoost =
            8;
        } else if (
          daysUntilRelease <= 7
        ) {
          launchBoost =
            4;
        }

        const score =
          attentionScore *
            0.58 +
          proximityScore *
            0.39 +
          rotation *
            3 +
          launchBoost;

        return {
          game,

          daysUntilRelease,

          attentionScore,

          proximityScore,

          rotation,

          score,
        };
      }
    )
    .sort(
      (
        first,
        second
      ) => {
        if (
          second.score !==
          first.score
        ) {
          return (
            second.score -
            first.score
          );
        }

        if (
          first.daysUntilRelease !==
          second.daysUntilRelease
        ) {
          return (
            first.daysUntilRelease -
            second.daysUntilRelease
          );
        }

        return (
          numberOrZero(
            second.game.hypes
          ) -
          numberOrZero(
            first.game.hypes
          )
        );
      }
    );
}

/* =========================================================
   SELECCIÓN

   Para 10 posiciones:

   1. mínimo 2 lanzamientos de hoy/mañana si existen
   2. mínimo 2 lanzamientos de los próximos 7 días
   3. mínimo 2 títulos relevantes de los próximos 30 días
   4. resto por puntuación global

   No son cuatro grupos completamente separados:
   deduplicamos automáticamente.

   Si una categoría no tiene suficientes juegos,
   sus lugares se liberan para el ranking general.
========================================================= */

function selectDailyGames(
  scored,
  limit
) {
  const selected = [];
  const selectedIds =
    new Set();

  function take(
    pool,
    amount,
    reason
  ) {
    let remaining =
      amount;

    for (
      const item of pool
    ) {
      if (
        remaining <= 0 ||
        selected.length >= limit
      ) {
        break;
      }

      const id =
        String(
          item.game.id
        );

      if (
        selectedIds.has(
          id
        )
      ) {
        continue;
      }

      selectedIds.add(
        id
      );

      selected.push({
        ...item,
        reason,
      });

      remaining -=
        1;
    }
  }

  /* -------------------------------------------------------
     HOY / MAÑANA
  ------------------------------------------------------- */

  take(
    scored.filter(
      (item) =>
        item.daysUntilRelease <= 1
    ),
    Math.min(
      2,
      limit
    ),
    "immediate"
  );

  /* -------------------------------------------------------
     PRÓXIMOS 7 DÍAS
  ------------------------------------------------------- */

  take(
    scored.filter(
      (item) =>
        item.daysUntilRelease <= 7
    ),
    Math.min(
      2,
      limit
    ),
    "near"
  );

  /* -------------------------------------------------------
     RELEVANTES · PRÓXIMOS 30 DÍAS
  ------------------------------------------------------- */

  take(
    scored.filter(
      (item) =>
        item.daysUntilRelease <= 30
    ),
    Math.min(
      2,
      limit
    ),
    "relevant"
  );

  /* -------------------------------------------------------
     MEJORES DEL CONJUNTO
  ------------------------------------------------------- */

  take(
    scored,
    limit,
    "ranking"
  );

  return selected.slice(
    0,
    limit
  );
}

/* =========================================================
   RESPUESTA
========================================================= */

function createSelectionGame(
  item,
  position
) {
  return {
    position,

    reason:
      item.reason,

    daysUntilRelease:
      item.daysUntilRelease,

    selectionScore:
      Number(
        item.score.toFixed(
          2
        )
      ),

    signals: {
      hype:
        numberOrZero(
          item.game.hypes
        ),

      attention:
        Number(
          item.attentionScore.toFixed(
            2
          )
        ),

      proximity:
        Number(
          item.proximityScore.toFixed(
            2
          )
        ),
    },

    game:
      createLightGame(
        item.game
      ),
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

    const {
      searchParams,
    } =
      new URL(
        request.url
      );

    const requestedLimit =
      parsePositiveInteger(
        searchParams.get(
          "limit"
        ),
        DEFAULT_LIMIT
      );

    const limit =
      Math.min(
        requestedLimit,
        MAX_LIMIT
      );

    const dayKey =
      getDayKey();

    /* -----------------------------------------------------
       1. Candidatos desde Supabase
    ----------------------------------------------------- */

    const candidates =
      await loadCandidates(
        environment
      );

    /* -----------------------------------------------------
       2. Scoring
    ----------------------------------------------------- */

    const scored =
      scoreCandidates(
        candidates,
        dayKey
      );

    /* -----------------------------------------------------
       3. Selección diaria
    ----------------------------------------------------- */

    const selected =
      selectDailyGames(
        scored,
        limit
      );

    /* -----------------------------------------------------
       4. Respuesta
    ----------------------------------------------------- */

    return NextResponse.json(
      {
        ok:
          true,

        source:
          "Tierra Vicio Database",

        mode:
          "actualidad-upcoming",

        date:
          dayKey,

        generatedAt:
          new Date()
            .toISOString(),

        candidateCount:
          candidates.length,

        count:
          selected.length,

        selection: {
          algorithm:
            "tierra-vicio-upcoming-v1",

          automatic:
            true,

          dailyRotation:
            true,

          priorities: [
            "immediate",
            "near",
            "relevant",
            "ranking",
          ],
        },

        games:
          selected.map(
            (
              item,
              index
            ) =>
              createSelectionGame(
                item,
                index + 1
              )
          ),
      },
      {
        status:
          200,

        headers: {
          /*
           * La selección es determinista durante el día.
           *
           * Permitimos cachearla una hora.
           *
           * No hace falta recalcularla para cada usuario.
           */

          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      }
    );
  } catch (error) {
    console.error(
      "[Tierra Vicio / Actualidad / Upcoming]",
      error
    );

    return NextResponse.json(
      {
        ok:
          false,

        error:
          error instanceof Error
            ? error.message
            : "Error desconocido generando Próximos.",
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
