import { NextResponse } from "next/server";

/* =========================================================
   TIERRA VICIO
   ACTUALIDAD · POPULARES · V2

   OBJETIVOS

   - Detectar juegos con atención real.
   - Favorecer lanzamientos recientes.
   - Evitar que los históricos dominen siempre.
   - Mantener grandes juegos cuando siguen siendo relevantes.
   - Rotación diaria perceptible.
   - Memoria de exposición.
   - Persistir 10 juegos diarios.
   - No consultar IGDB desde visitantes.
========================================================= */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =========================================================
   CONFIGURACIÓN
========================================================= */

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 20;

const RECENT_CANDIDATE_LIMIT = 500;
const ATTENTION_CANDIDATE_LIMIT = 500;

const HISTORY_DAYS = 14;
const LOOKBACK_DAYS = 365;

const MAX_EXPOSURE_PENALTY = 24;

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
   SUPABASE · GET
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
      `Supabase GET ${response.status}: ${errorText}`
    );
  }

  return response.json();
}

/* =========================================================
   SUPABASE · POST
========================================================= */

async function supabasePost(
  environment,
  path,
  body
) {
  const response =
    await fetch(
      `${environment.supabaseUrl}/rest/v1/${path}`,
      {
        method: "POST",

        headers: {
          apikey:
            environment.supabaseSecret,

          Authorization:
            `Bearer ${environment.supabaseSecret}`,

          Accept:
            "application/json",

          "Content-Type":
            "application/json",

          Prefer:
            "return=representation,resolution=merge-duplicates",
        },

        body:
          JSON.stringify(body),

        cache: "no-store",
      }
    );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `Supabase POST ${response.status}: ${errorText}`
    );
  }

  const text =
    await response.text();

  if (!text) {
    return [];
  }

  return JSON.parse(text);
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
   FECHAS
========================================================= */

function getDayKey() {
  return new Date()
    .toISOString()
    .slice(0, 10);
}

function getPastDateKey(daysAgo) {
  const date =
    new Date();

  date.setUTCDate(
    date.getUTCDate() -
      daysAgo
  );

  return date
    .toISOString()
    .slice(0, 10);
}

function getPastIso(daysAgo) {
  const date =
    new Date();

  date.setUTCDate(
    date.getUTCDate() -
      daysAgo
  );

  return date.toISOString();
}

/* =========================================================
   ROTACIÓN DIARIA DETERMINISTA
========================================================= */

function dailyRotation(
  gameId,
  dayKey
) {
  const input =
    `${dayKey}:${gameId}:popular`;

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
   ANTIGÜEDAD DEL LANZAMIENTO
========================================================= */

function getDaysSinceRelease(
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
        todayUtc -
        releaseUtc
      ) /
        86400000
    )
  );
}

/* =========================================================
   FRESCURA

   Cuanto más reciente es el lanzamiento,
   mayor es la señal.

   No hacemos que un juego de varios meses
   valga cero: simplemente necesita una señal
   de atención mayor para competir.
========================================================= */

function getFreshnessScore(days) {
  if (days <= 3) {
    return 100;
  }

  if (days <= 7) {
    return 97;
  }

  if (days <= 14) {
    return 92;
  }

  if (days <= 30) {
    return 84;
  }

  if (days <= 60) {
    return 70;
  }

  if (days <= 90) {
    return 57;
  }

  if (days <= 180) {
    return 38;
  }

  if (days <= 270) {
    return 24;
  }

  if (days <= 365) {
    return 14;
  }

  return 4;
}

/* =========================================================
   IMPULSO DE LANZAMIENTO
========================================================= */

function getLaunchBoost(days) {
  if (days <= 3) {
    return 16;
  }

  if (days <= 7) {
    return 14;
  }

  if (days <= 14) {
    return 11;
  }

  if (days <= 30) {
    return 7;
  }

  if (days <= 60) {
    return 3;
  }

  return 0;
}

/* =========================================================
   CAMPOS
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
   CANDIDATOS RECIENTES
========================================================= */

async function loadRecentCandidates(
  environment,
  fromIso,
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

      `&first_release_date=gte.${encodeURIComponent(
        fromIso
      )}`,

      `&first_release_date=lte.${encodeURIComponent(
        nowIso
      )}`,

      "&order=first_release_date.desc,id.asc",

      `&limit=${RECENT_CANDIDATE_LIMIT}`,
    ].join("")
  );
}

/* =========================================================
   CANDIDATOS POR ATENCIÓN

   Usamos total_rating_count como una señal disponible
   actualmente en nuestra base.

   Esto NO significa que el ranking final sea simplemente
   "los más votados".
========================================================= */

async function loadAttentionCandidates(
  environment,
  fromIso,
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

      `&first_release_date=gte.${encodeURIComponent(
        fromIso
      )}`,

      `&first_release_date=lte.${encodeURIComponent(
        nowIso
      )}`,

      "&total_rating_count=not.is.null",

      "&order=total_rating_count.desc.nullslast,first_release_date.desc,id.asc",

      `&limit=${ATTENTION_CANDIDATE_LIMIT}`,
    ].join("")
  );
}

/* =========================================================
   CARGAR CANDIDATOS

   Dos piscinas:

   1. Lanzamientos recientes.
   2. Juegos con mayor atención dentro de la ventana.

   Se fusionan por ID.
========================================================= */

async function loadCandidates(
  environment
) {
  const nowIso =
    new Date()
      .toISOString();

  const fromIso =
    getPastIso(
      LOOKBACK_DAYS
    );

  const [
    recentCandidates,
    attentionCandidates,
  ] =
    await Promise.all([
      loadRecentCandidates(
        environment,
        fromIso,
        nowIso
      ),

      loadAttentionCandidates(
        environment,
        fromIso,
        nowIso
      ),
    ]);

  const gamesById =
    new Map();

  for (
    const game of recentCandidates
  ) {
    gamesById.set(
      String(game.id),
      game
    );
  }

  for (
    const game of attentionCandidates
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
      recent:
        recentCandidates.length,

      attention:
        attentionCandidates.length,

      unique:
        gamesById.size,

      lookbackDays:
        LOOKBACK_DAYS,
    },
  };
}

/* =========================================================
   HISTORIAL DE EXPOSICIÓN
========================================================= */

/* =========================================================
   HISTORIAL DE EXPOSICIÓN
========================================================= */

async function loadExposureHistory(
  environment,
  dayKey
) {
  const fromDate =
    getPastDateKey(
      HISTORY_DAYS
    );

  return supabaseGet(
    environment,
    [
      "actualidad_slots",

      "?select=",
      [
        "selection_date",
        "slot",
        "game_id",
        "reason",
        "manual_override",
        "locked",
      ].join(","),

      "&section=eq.popular",

      `&selection_date=gte.${fromDate}`,

      `&selection_date=lt.${dayKey}`,

      "&order=selection_date.desc,slot.asc",
    ].join("")
  );
}

/* =========================================================
   MAPA DE EXPOSICIÓN
========================================================= */

function buildExposureMap(
  history,
  dayKey
) {
  const map =
    new Map();

  const today =
    new Date(
      `${dayKey}T00:00:00.000Z`
    );

  for (
    const row of history
  ) {
    const id =
      String(
        row.game_id
      );

    if (!map.has(id)) {
      map.set(
        id,
        {
          appearances:
            0,

          consecutiveDays:
            0,

          lastSeenDaysAgo:
            null,

          dates:
            new Set(),
        }
      );
    }

    const entry =
      map.get(id);

    const dateKey =
      row.selection_date;

    if (
      entry.dates.has(
        dateKey
      )
    ) {
      continue;
    }

    entry.dates.add(
      dateKey
    );

    entry.appearances += 1;

    const date =
      new Date(
        `${dateKey}T00:00:00.000Z`
      );

    const daysAgo =
      Math.round(
        (
          today.getTime() -
          date.getTime()
        ) /
          86400000
      );

    if (
      entry.lastSeenDaysAgo === null ||
      daysAgo <
        entry.lastSeenDaysAgo
    ) {
      entry.lastSeenDaysAgo =
        daysAgo;
    }
  }

  for (
    const entry of map.values()
  ) {
    let consecutive =
      0;

    for (
      let daysAgo = 1;
      daysAgo <= HISTORY_DAYS;
      daysAgo += 1
    ) {
      const date =
        new Date(today);

      date.setUTCDate(
        date.getUTCDate() -
          daysAgo
      );

      const key =
        date
          .toISOString()
          .slice(0, 10);

      if (
        entry.dates.has(key)
      ) {
        consecutive += 1;
      } else {
        break;
      }
    }

    entry.consecutiveDays =
      consecutive;
  }

  return map;
}

/* =========================================================
   PENALIZACIÓN POR EXPOSICIÓN
========================================================= */

function getExposurePenalty(
  exposure,
  daysSinceRelease
) {
  if (!exposure) {
    return 0;
  }

  const appearances =
    exposure.appearances || 0;

  const consecutive =
    exposure.consecutiveDays || 0;

  const lastSeen =
    exposure.lastSeenDaysAgo;

  let penalty = 0;

  penalty +=
    Math.min(
      appearances * 1.5,
      8
    );

  if (consecutive >= 1) {
    penalty += 3;
  }

  if (consecutive >= 2) {
    penalty += 5;
  }

  if (consecutive >= 3) {
    penalty += 6;
  }

  if (lastSeen === 1) {
    penalty += 3;
  } else if (
    lastSeen === 2
  ) {
    penalty += 1.5;
  }

  let protection = 1;

  if (daysSinceRelease <= 3) {
    protection = 0.35;
  } else if (
    daysSinceRelease <= 7
  ) {
    protection = 0.45;
  } else if (
    daysSinceRelease <= 14
  ) {
    protection = 0.6;
  } else if (
    daysSinceRelease <= 30
  ) {
    protection = 0.78;
  }

  return clamp(
    penalty * protection,
    0,
    MAX_EXPOSURE_PENALTY
  );
}

/* =========================================================
   BONIFICACIÓN POR REGRESO
========================================================= */

function getReturnBonus(
  exposure
) {
  if (!exposure) {
    return 3;
  }

  const lastSeen =
    exposure.lastSeenDaysAgo;

  if (lastSeen === null) {
    return 3;
  }

  if (lastSeen >= 10) {
    return 5;
  }

  if (lastSeen >= 7) {
    return 4;
  }

  if (lastSeen >= 5) {
    return 3;
  }

  if (lastSeen >= 3) {
    return 1.5;
  }

  return 0;
}

/* =========================================================
   NORMALIZADOR DE ATENCIÓN
========================================================= */

function createAttentionNormalizer(
  candidates
) {
  const maximum =
    Math.max(
      1,
      ...candidates.map(
        (game) =>
          numberOrZero(
            game.total_rating_count
          ) +
          numberOrZero(
            game.rating_count
          ) * 12
      )
    );

  const maximumLog =
    Math.log1p(
      maximum
    );

  return function normalizeAttention(
    game
  ) {
    const total =
      Math.max(
        0,
        numberOrZero(
          game.total_rating_count
        ) +
          numberOrZero(
            game.rating_count
          ) * 12
      );

    if (
      maximumLog <= 0
    ) {
      return 0;
    }

    return (
      Math.log1p(total) /
      maximumLog
    ) * 100;
  };
}

/* =========================================================
   NORMALIZADOR DE HYPE
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
    game
  ) {
    const hypes =
      Math.max(
        0,
        numberOrZero(
          game.hypes
        )
      );

    if (
      maximumLog <= 0
    ) {
      return 0;
    }

    return (
      Math.log1p(hypes) /
      maximumLog
    ) * 100;
  };
}

/* =========================================================
   SEÑAL MÍNIMA DE POPULARIDAD
========================================================= */

function hasMinimumPopularitySignal(
  game
) {
  const totalRatingCount =
    numberOrZero(
      game.total_rating_count
    );

  const ratingCount =
    numberOrZero(
      game.rating_count
    );

  const hypes =
    numberOrZero(
      game.hypes
    );

  return (
    totalRatingCount >= 5 ||
    ratingCount >= 5 ||
    hypes >= 50
  );
}

/* =========================================================
   CONFIANZA / CALIDAD
========================================================= */

function getQualityConfidence(
  game
) {
  const rating =
    numberOrZero(
      game.total_rating
    );

  const count =
    numberOrZero(
      game.total_rating_count
    );

  if (
    rating >= 80 &&
    count >= 50
  ) {
    return 6;
  }

  if (
    rating >= 70 &&
    count >= 20
  ) {
    return 4;
  }

  if (
    rating >= 60 &&
    count >= 10
  ) {
    return 2;
  }

  return 0;
}

/* =========================================================
   SCORING · POPULAR V2
========================================================= */

function scoreCandidates(
  candidates,
  dayKey,
  exposureMap
) {
  const normalizeAttention =
    createAttentionNormalizer(
      candidates
    );

  const normalizeHype =
    createHypeNormalizer(
      candidates
    );

  return candidates
    .map((game) => {
      const daysSinceRelease =
        getDaysSinceRelease(
          game.first_release_date
        );

      const attentionScore =
        normalizeAttention(
          game
        );

      const hypeScore =
        normalizeHype(
          game
        );

      const freshnessScore =
        getFreshnessScore(
          daysSinceRelease
        );

      const launchBoost =
        getLaunchBoost(
          daysSinceRelease
        );

      const qualityConfidence =
        getQualityConfidence(
          game
        );

      const rotation =
        dailyRotation(
          game.id,
          dayKey
        );

      const exposure =
        exposureMap.get(
          String(game.id)
        ) || null;

      const exposurePenalty =
        getExposurePenalty(
          exposure,
          daysSinceRelease
        );

      const returnBonus =
        getReturnBonus(
          exposure
        );

      const featuredBoost =
        game.featured === true
          ? 5
          : 0;

      const baseScore =
        attentionScore * 0.45 +
        hypeScore * 0.25 +
        freshnessScore * 0.18 +
        launchBoost * 0.07 +
        qualityConfidence +
        featuredBoost +
        rotation * 2;

      const score =
        baseScore +
        returnBonus -
        exposurePenalty;

      return {
        game,

        daysSinceRelease,

        attentionScore,

        hypeScore,

        freshnessScore,

        launchBoost,

        qualityConfidence,

        rotation,

        exposure,

        exposurePenalty,

        returnBonus,

        baseScore,

        score,
      };
    })
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
          first.daysSinceRelease -
          second.daysSinceRelease
        );
      }
    );
}

/* =========================================================
   SELECCIÓN
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

  const veryRecent =
    scored.filter(
      (item) =>
        item.daysSinceRelease >= 0 &&
        item.daysSinceRelease <= 30 &&
        hasMinimumPopularitySignal(
          item.game
        )
    );

  take(
    veryRecent,
    Math.min(
      4,
      limit
    ),
    "very_recent"
  );

  const recent =
    scored.filter(
      (item) =>
        item.daysSinceRelease >= 31 &&
        item.daysSinceRelease <= 90
    );

  take(
    recent,
    Math.min(
      3,
      limit
    ),
    "recent"
  );

  const established =
    scored.filter(
      (item) =>
        item.daysSinceRelease >= 91 &&
        item.daysSinceRelease <= 365
    );

  take(
    established,
    Math.min(
      2,
      limit
    ),
    "established"
  );

  take(
    scored,
    1,
    "wildcard"
  );

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
   GUARDAR SELECCIÓN
========================================================= */


async function saveDailySelection(
  environment,
  dayKey,
  selected
) {
  if (
    selected.length === 0
  ) {
    return [];
  }

  const rows =
    selected.map(
      (
        item,
        index
      ) => ({
        selection_date:
          dayKey,

        section:
          "popular",

        slot:
          index + 1,

        game_id:
          item.game.id,

        reason:
          item.reason,

        selection_score:
          Number(
            item.score.toFixed(
              4
            )
          ),

        metadata: {
          daysSinceRelease:
            item.daysSinceRelease,

          attention:
            Number(
              item.attentionScore.toFixed(
                4
              )
            ),

          hype:
            Number(
              item.hypeScore.toFixed(
                4
              )
            ),

          freshness:
            Number(
              item.freshnessScore.toFixed(
                4
              )
            ),

          launchBoost:
            Number(
              item.launchBoost.toFixed(
                4
              )
            ),

          qualityConfidence:
            Number(
              item.qualityConfidence.toFixed(
                4
              )
            ),

          dailyRotation:
            Number(
              item.rotation.toFixed(
                4
              )
            ),

          exposurePenalty:
            Number(
              item.exposurePenalty.toFixed(
                4
              )
            ),

          returnBonus:
            Number(
              item.returnBonus.toFixed(
                4
              )
            ),

          previousAppearances:
            item.exposure?.appearances ||
            0,

          previousConsecutiveDays:
            item.exposure?.consecutiveDays ||
            0,

          algorithm:
            "tierra-vicio-popular-v2",
        },

        manual_override:
          false,

        locked:
          false,

        updated_at:
          new Date()
            .toISOString(),
      })
    );

  return supabasePost(
    environment,
    "actualidad_slots?on_conflict=selection_date,section,slot",
    rows
  );
}

/* =========================================================
   SELECCIÓN DE HOY
========================================================= */

async function loadTodaySelection(
  environment,
  dayKey
) {
  return supabaseGet(
    environment,
    [
      "actualidad_slots",

      "?select=",
      [
        "selection_date",
        "section",
        "slot",
        "game_id",
        "reason",
        "selection_score",
        "metadata",
        "manual_override",
        "locked",
      ].join(","),

      "&section=eq.popular",

      `&selection_date=eq.${dayKey}`,

      "&order=slot.asc",
    ].join("")
  );
}

/* =========================================================
   JUEGOS DE SELECCIÓN GUARDADA
========================================================= */

async function loadGamesForStoredSelection(
  environment,
  rows
) {
  if (
    rows.length === 0
  ) {
    return [];
  }

  const ids =
    Array.from(
      new Set(
        rows.map(
          (row) =>
            row.game_id
        )
      )
    );

  const games =
    await supabaseGet(
      environment,
      [
        "games",

        "?select=",
        CANDIDATE_FIELDS,

        `&id=in.(${ids.join(
          ","
        )})`,
      ].join("")
    );

  const gamesById =
    new Map(
      games.map(
        (game) => [
          String(game.id),
          game,
        ]
      )
    );

  return rows
    .map((row) => {
      const game =
        gamesById.get(
          String(
            row.game_id
          )
        );

      if (!game) {
        return null;
      }

      return {
        row,
        game,
      };
    })
    .filter(Boolean);
}

/* =========================================================
   RESPUESTA DE JUEGO NUEVO
========================================================= */

function createSelectionGame(
  item,
  position
) {
  return {
    position,

    reason:
      item.reason,

    daysSinceRelease:
      item.daysSinceRelease,

    selectionScore:
      Number(
        item.score.toFixed(
          2
        )
      ),

    signals: {
      attention:
        Number(
          item.attentionScore.toFixed(
            2
          )
        ),

      hype:
        Number(
          item.hypeScore.toFixed(
            2
          )
        ),

      freshness:
        Number(
          item.freshnessScore.toFixed(
            2
          )
        ),

      launchBoost:
        Number(
          item.launchBoost.toFixed(
            2
          )
        ),

      qualityConfidence:
        Number(
          item.qualityConfidence.toFixed(
            2
          )
        ),

      dailyRotation:
        Number(
          item.rotation.toFixed(
            4
          )
        ),

      exposurePenalty:
        Number(
          item.exposurePenalty.toFixed(
            2
          )
        ),

      returnBonus:
        Number(
          item.returnBonus.toFixed(
            2
          )
        ),

      previousAppearances:
        item.exposure?.appearances ||
        0,

      previousConsecutiveDays:
        item.exposure?.consecutiveDays ||
        0,
    },

    game:
      createLightGame(
        item.game
      ),
  };
}

/* =========================================================
   RESPUESTA DE JUEGO GUARDADO
========================================================= */

function createStoredSelectionGame(
  item
) {
  const metadata =
    item.row.metadata || {};

  return {
    position:
      item.row.slot,

    reason:
      item.row.reason,

    daysSinceRelease:
      metadata.daysSinceRelease ??
      getDaysSinceRelease(
        item.game.first_release_date
      ),

    selectionScore:
      numberOrZero(
        item.row.selection_score
      ),

    signals: {
      attention:
        metadata.attention ?? 0,

      hype:
        metadata.hype ?? 0,

      freshness:
        metadata.freshness ?? 0,

      launchBoost:
        metadata.launchBoost ?? 0,

      qualityConfidence:
        metadata.qualityConfidence ?? 0,

      dailyRotation:
        metadata.dailyRotation ?? 0,

      exposurePenalty:
        metadata.exposurePenalty ?? 0,

      returnBonus:
        metadata.returnBonus ?? 0,

      previousAppearances:
        metadata.previousAppearances ??
        0,

      previousConsecutiveDays:
        metadata.previousConsecutiveDays ??
        0,
    },

    manualOverride:
      item.row.manual_override ===
      true,

    locked:
      item.row.locked ===
      true,

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

    const refresh =
      [
        "1",
        "true",
        "yes",
      ].includes(
        String(
          searchParams.get(
            "refresh"
          ) || ""
        )
          .trim()
          .toLowerCase()
      );

    /* =====================================================
       1 · ¿YA EXISTE LA SELECCIÓN DE HOY?
    ===================================================== */

    const todayRows =
      await loadTodaySelection(
        environment,
        dayKey
      );

    if (
      !refresh &&
      todayRows.length >=
      Math.min(
        limit,
        DEFAULT_LIMIT
      )
    ) {
      const stored =
        await loadGamesForStoredSelection(
          environment,
          todayRows.slice(
            0,
            limit
          )
        );

      return NextResponse.json(
        {
          ok: true,

          source:
            "Tierra Vicio Database",

          mode:
            "actualidad-popular",

          date:
            dayKey,

          generatedAt:
            new Date()
              .toISOString(),

          persisted:
            true,

          generatedNow:
            false,

          count:
            stored.length,

          selection: {
            algorithm:
              "tierra-vicio-popular-v2",

            automatic:
              true,

            dailyRotation:
              true,

            exposureMemory:
              true,

            historyDays:
              HISTORY_DAYS,

            lookbackDays:
              LOOKBACK_DAYS,

            composition: {
              veryRecent:
                4,

              recent:
                3,

              established:
                2,

              wildcard:
                1,
            },
          },

          games:
            stored.map(
              createStoredSelectionGame
            ),
        },
        {
          status: 200,

          headers: {
            "Cache-Control":
              "public, s-maxage=3600, stale-while-revalidate=7200",
          },
        }
      );
    }

    /* =====================================================
       2 · CANDIDATOS + HISTORIAL
    ===================================================== */

    const [
      candidateResult,
      history,
    ] =
      await Promise.all([
        loadCandidates(
          environment
        ),

        loadExposureHistory(
          environment,
          dayKey
        ),
      ]);

    const {
      candidates,
      poolStats,
    } =
      candidateResult;

    /* =====================================================
       3 · MEMORIA
    ===================================================== */

    const exposureMap =
      buildExposureMap(
        history,
        dayKey
      );

    /* =====================================================
       4 · SCORING
    ===================================================== */

    const scored =
      scoreCandidates(
        candidates,
        dayKey,
        exposureMap
      );

    /* =====================================================
       5 · SELECCIÓN
    ===================================================== */

    const selected =
      selectDailyGames(
        scored,
        limit
      );

    /* =====================================================
       6 · GUARDAR
    ===================================================== */

    await saveDailySelection(
      environment,
      dayKey,
      selected
    );

    /* =====================================================
       7 · ESTADÍSTICAS
    ===================================================== */

    const pools = {
      veryRecent:
        scored.filter(
          (item) =>
            item.daysSinceRelease >= 0 &&
            item.daysSinceRelease <= 30 &&
            hasMinimumPopularitySignal(
              item.game
            )
        ).length,

      recent:
        scored.filter(
          (item) =>
            item.daysSinceRelease >= 31 &&
            item.daysSinceRelease <= 90
        ).length,

      established:
        scored.filter(
          (item) =>
            item.daysSinceRelease >= 91 &&
            item.daysSinceRelease <= 365
        ).length,
    };

    /* =====================================================
       RESPUESTA
    ===================================================== */

    return NextResponse.json(
      {
        ok: true,

        source:
          "Tierra Vicio Database",

        mode:
          "actualidad-popular",

        date:
          dayKey,

        generatedAt:
          new Date()
            .toISOString(),

        persisted:
          true,

        generatedNow:
          true,

        refreshed:
          refresh,

        candidateCount:
          candidates.length,

        candidateSources:
          poolStats,

        history: {
          days:
            HISTORY_DAYS,

          rows:
            history.length,

          gamesWithHistory:
            exposureMap.size,
        },

        count:
          selected.length,

        selection: {
          algorithm:
            "tierra-vicio-popular-v2",

          automatic:
            true,

          dailyRotation:
            true,

          exposureMemory:
            true,

          historyDays:
            HISTORY_DAYS,

          lookbackDays:
            LOOKBACK_DAYS,

          composition: {
            veryRecent:
              4,

            recent:
              3,

            established:
              2,

            wildcard:
              1,
          },

          windows: {
            veryRecent:
              "0-30 days",

            recent:
              "31-90 days",

            established:
              "91-365 days",

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
        status: 200,

        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      }
    );
  } catch (error) {
    console.error(
      "[Tierra Vicio / Actualidad / Popular V2]",
      error
    );

    return NextResponse.json(
      {
        ok: false,

        error:
          error instanceof Error
            ? error.message
            : "Error desconocido generando Populares.",
      },
      {
        status: 500,

        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      }
    );
  }
}
