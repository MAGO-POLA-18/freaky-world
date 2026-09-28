import { NextResponse } from "next/server";

/* =========================================================
   TIERRA VICIO
   ACTUALIDAD · PRÓXIMOS LANZAMIENTOS · V3
========================================================= */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =========================================================
   CONFIGURACIÓN
========================================================= */

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 20;

/*
 * En V3 dejamos de depender de:
 *
 * "los primeros 500 juegos por fecha".
 *
 * Construimos dos pools:
 *
 * 1. FUTUROS CERCANOS
 *    Garantiza representación de lanzamientos próximos.
 *
 * 2. FUTUROS RELEVANTES
 *    Ordenados por hype.
 *    Permite que juegos importantes de meses posteriores
 *    entren en el conjunto de candidatos.
 *
 * Después:
 *
 * - deduplicamos
 * - puntuamos
 * - aplicamos el mismo 3 + 3 + 3 + 1
 *
 * Seguimos SIN consultar IGDB desde este endpoint.
 */

const NEAREST_CANDIDATE_LIMIT = 500;
const HYPE_CANDIDATE_LIMIT = 500;

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

  const number =
    Number(value);

  if (
    !Number.isSafeInteger(number) ||
    number <= 0
  ) {
    return fallback;
  }

  return number;
}

function numberOrZero(value) {
  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

function clamp(
  value,
  minimum,
  maximum
) {
  return Math.min(
    Math.max(
      value,
      minimum
    ),
    maximum
  );
}

/* =========================================================
   FECHA DIARIA
========================================================= */

function getDayKey() {
  return new Date()
    .toISOString()
    .slice(0, 10);
}

/* =========================================================
   ROTACIÓN DIARIA DETERMINISTA
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
      input.charCodeAt(index);

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
    new Date(releaseDate);

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
   CERCANÍA
========================================================= */

function getProximityScore(days) {
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
    return 82;
  }

  if (days <= 30) {
    return 72;
  }

  if (days <= 60) {
    return 58;
  }

  if (days <= 90) {
    return 46;
  }

  if (days <= 180) {
    return 32;
  }

  if (days <= 365) {
    return 18;
  }

  return 8;
}

/* =========================================================
   CAMPOS DE CANDIDATOS
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
   CARGAR CANDIDATOS CERCANOS
========================================================= */

async function loadNearestCandidates(
  environment,
  nowIso
) {
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

      `&limit=${NEAREST_CANDIDATE_LIMIT}`,
    ].join("")
  );
}

/* =========================================================
   CARGAR CANDIDATOS RELEVANTES
========================================================= */

async function loadHypeCandidates(
  environment,
  nowIso
) {
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

      "&hypes=not.is.null",

      "&order=hypes.desc.nullslast,first_release_date.asc,id.asc",

      `&limit=${HYPE_CANDIDATE_LIMIT}`,
    ].join("")
  );
}

/* =========================================================
   CARGAR TODOS LOS CANDIDATOS
========================================================= */

async function loadCandidates(
  environment
) {
  const nowIso =
    new Date()
      .toISOString();

  /*
   * Las dos consultas son independientes.
   * Las ejecutamos juntas para reducir latencia.
   */

  const [
    nearestCandidates,
    hypeCandidates,
  ] =
    await Promise.all([
      loadNearestCandidates(
        environment,
        nowIso
      ),

      loadHypeCandidates(
        environment,
        nowIso
      ),
    ]);

  /*
   * Deduplicación por ID.
   *
   * Si un juego aparece en ambos pools,
   * sólo ocupa una posición.
   */

  const gamesById =
    new Map();

  for (
    const game of nearestCandidates
  ) {
    gamesById.set(
      String(game.id),
      game
    );
  }

  for (
    const game of hypeCandidates
  ) {
    gamesById.set(
      String(game.id),
      game
    );
  }

  return {
    candidates:
      Array.from(
        gamesById.values()
      ),

    poolStats: {
      nearest:
        nearestCandidates.length,

      hype:
        hypeCandidates.length,

      unique:
        gamesById.size,
    },
  };
}

/* =========================================================
   NORMALIZACIÓN DEL HYPE
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
      Math.log1p(hype) /
      maximumLog
    ) * 100;
  };
}

/* =========================================================
   ATENCIÓN / RELEVANCIA
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
      ) * 6,
      0,
      30
    );

  const featuredBoost =
    game.featured === true
      ? 10
      : 0;

  return clamp(
    hypeScore * 0.9 +
      ratingSignal * 0.1 +
      featuredBoost,
    0,
    110
  );
}

/* =========================================================
   SCORING GENERAL
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

        const attentionScore =
          getAttentionScore(
            game,
            normalizeHype
          );

        const proximityScore =
          getProximityScore(
            daysUntilRelease
          );

        const rotation =
          dailyRotation(
            game.id,
            dayKey
          );

        const score =
          attentionScore *
            0.64 +
          proximityScore *
            0.33 +
          rotation *
            3;

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

        return (
          first.daysUntilRelease -
          second.daysUntilRelease
        );
      }
    );
}

/* =========================================================
   ORDEN POR RELEVANCIA
========================================================= */

function sortByRelevance(
  items
) {
  return [
    ...items,
  ].sort(
    (
      first,
      second
    ) => {
      if (
        second.attentionScore !==
        first.attentionScore
      ) {
        return (
          second.attentionScore -
          first.attentionScore
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
        second.rotation -
        first.rotation
      );
    }
  );
}

/* =========================================================
   SELECCIÓN V3

   3 · INMEDIATOS
       0–7 días

   3 · CERCANOS
       8–30 días

   3 · IMPORTANTES
       31–180 días

   1 · COMODÍN
       mejor candidato restante
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
        selectedIds.has(id)
      ) {
        continue;
      }

      selectedIds.add(id);

      selected.push({
        ...item,
        reason,
      });

      remaining -= 1;
    }
  }

  /* =======================================================
     1 · INMEDIATOS
  ======================================================= */

  const immediate =
    sortByRelevance(
      scored.filter(
        (item) =>
          item.daysUntilRelease >= 0 &&
          item.daysUntilRelease <= 7
      )
    );

  take(
    immediate,
    Math.min(
      3,
      limit
    ),
    "immediate"
  );

  /* =======================================================
     2 · CERCANOS
  ======================================================= */

  const near =
    sortByRelevance(
      scored.filter(
        (item) =>
          item.daysUntilRelease >= 8 &&
          item.daysUntilRelease <= 30
      )
    );

  take(
    near,
    Math.min(
      3,
      limit
    ),
    "near"
  );

  /* =======================================================
     3 · IMPORTANTES
  ======================================================= */

  const important =
    sortByRelevance(
      scored.filter(
        (item) =>
          item.daysUntilRelease >= 31 &&
          item.daysUntilRelease <= 180
      )
    );

  take(
    important,
    Math.min(
      3,
      limit
    ),
    "important"
  );

  /* =======================================================
     4 · COMODÍN
  ======================================================= */

  take(
    scored,
    1,
    "wildcard"
  );

  /* =======================================================
     5 · RELLENO
  ======================================================= */

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
   RESPUESTA DE CADA POSICIÓN
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

      dailyRotation:
        Number(
          item.rotation.toFixed(
            4
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

    /* =====================================================
       1 · CANDIDATOS
    ===================================================== */

    const {
      candidates,
      poolStats,
    } =
      await loadCandidates(
        environment
      );

    /* =====================================================
       2 · SCORING
    ===================================================== */

    const scored =
      scoreCandidates(
        candidates,
        dayKey
      );

    /* =====================================================
       3 · SELECCIÓN
    ===================================================== */

    const selected =
      selectDailyGames(
        scored,
        limit
      );

    /* =====================================================
       4 · ESTADÍSTICAS
    ===================================================== */

    const pools = {
      immediate:
        scored.filter(
          (item) =>
            item.daysUntilRelease <= 7
        ).length,

      near:
        scored.filter(
          (item) =>
            item.daysUntilRelease >= 8 &&
            item.daysUntilRelease <= 30
        ).length,

      important:
        scored.filter(
          (item) =>
            item.daysUntilRelease >= 31 &&
            item.daysUntilRelease <= 180
        ).length,

      longTerm:
        scored.filter(
          (item) =>
            item.daysUntilRelease > 180
        ).length,
    };

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
          "actualidad-upcoming",

        date:
          dayKey,

        generatedAt:
          new Date()
            .toISOString(),

        candidateCount:
          candidates.length,

        candidateSources:
          poolStats,

        count:
          selected.length,

        selection: {
          algorithm:
            "tierra-vicio-upcoming-v3",

          automatic:
            true,

          dailyRotation:
            true,

          composition: {
            immediate:
              3,

            near:
              3,

            important:
              3,

            wildcard:
              1,
          },

          windows: {
            immediate:
              "0-7 days",

            near:
              "8-30 days",

            important:
              "31-180 days",

            wildcard:
              "best remaining candidate",
          },

          pools,
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
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      }
    );
  } catch (error) {
    console.error(
      "[Tierra Vicio / Actualidad / Upcoming V3]",
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
