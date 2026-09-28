import { NextResponse } from "next/server";

/* =========================================================
   TIERRA VICIO
   ACTUALIDAD · PRÓXIMOS LANZAMIENTOS · V4

   OBJETIVOS

   - Próximos relevantes.
   - Lanzamientos cercanos.
   - Grandes juegos futuros.
   - Rotación diaria perceptible.
   - Evitar repetición excesiva.
   - Mantener juegos importantes cuando corresponde.
   - Guardar la selección diaria.
   - No consultar IGDB desde visitantes.
========================================================= */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =========================================================
   CONFIGURACIÓN
========================================================= */

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 20;

const NEAREST_CANDIDATE_LIMIT = 500;
const HYPE_CANDIDATE_LIMIT = 500;

/*
 * Cuántos días miramos hacia atrás para conocer
 * la exposición reciente de cada juego.
 */
const HISTORY_DAYS = 14;

/*
 * La penalización NO elimina juegos.
 *
 * Sólo reduce temporalmente su prioridad cuando
 * llevan demasiada exposición.
 *
 * La proximidad y la relevancia pueden superar
 * esta penalización.
 */
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

        cache:
          "no-store",
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

        cache:
          "no-store",
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
   CANDIDATOS CERCANOS
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
   CANDIDATOS POR HYPE
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
   CARGAR CANDIDATOS
========================================================= */

async function loadCandidates(
  environment
) {
  const nowIso =
    new Date()
      .toISOString();

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

      "&section=eq.upcoming",

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

    if (
      !map.has(id)
    ) {
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

  /*
   * Calculamos días consecutivos hacia atrás.
   */

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

   PRINCIPIO:

   Un juego no desaparece porque haya salido ayer.

   Pero si lleva varios días apareciendo,
   damos espacio a alternativas comparables.

   Cuanto más cerca está el lanzamiento,
   menor es la penalización efectiva.
========================================================= */

function getExposurePenalty(
  exposure,
  daysUntilRelease
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

  let penalty =
    0;

  /*
   * Repetición acumulada.
   */
  penalty +=
    Math.min(
      appearances * 1.4,
      8
    );

  /*
   * Repetición consecutiva pesa más.
   */
  if (consecutive >= 1) {
    penalty += 3;
  }

  if (consecutive >= 2) {
    penalty += 5;
  }

  if (consecutive >= 3) {
    penalty += 6;
  }

  /*
   * Si acaba de aparecer,
   * pequeño descanso adicional.
   */
  if (lastSeen === 1) {
    penalty += 3;
  } else if (lastSeen === 2) {
    penalty += 1.5;
  }

  /*
   * PROTECCIÓN POR PROXIMIDAD.
   *
   * Un lanzamiento inminente no debe desaparecer
   * simplemente porque apareció ayer.
   */

  let protection =
    1;

  if (daysUntilRelease <= 1) {
    protection =
      0.2;
  } else if (
    daysUntilRelease <= 3
  ) {
    protection =
      0.3;
  } else if (
    daysUntilRelease <= 7
  ) {
    protection =
      0.45;
  } else if (
    daysUntilRelease <= 14
  ) {
    protection =
      0.65;
  } else if (
    daysUntilRelease <= 30
  ) {
    protection =
      0.8;
  }

  return clamp(
    penalty *
      protection,
    0,
    MAX_EXPOSURE_PENALTY
  );
}

/* =========================================================
   BONIFICACIÓN POR REGRESO

   Si un juego relevante lleva varios días sin aparecer,
   recibe una pequeña oportunidad extra.

   Nunca domina hype o proximidad.
========================================================= */

function getReturnBonus(
  exposure
) {
  if (!exposure) {
    return 3;
  }

  const lastSeen =
    exposure.lastSeenDaysAgo;

  if (
    lastSeen === null
  ) {
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
   NORMALIZACIÓN HYPE
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
   ATENCIÓN
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
   SCORING V4
========================================================= */

function scoreCandidates(
  candidates,
  dayKey,
  exposureMap
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

        const exposure =
          exposureMap.get(
            String(game.id)
          ) || null;

        const exposurePenalty =
          getExposurePenalty(
            exposure,
            daysUntilRelease
          );

        const returnBonus =
          getReturnBonus(
            exposure
          );

        /*
         * BASE V3:
         *
         * relevancia + proximidad + rotación
         *
         * V4:
         *
         * + regreso
         * - exposición reciente
         */

        const baseScore =
          attentionScore *
            0.64 +
          proximityScore *
            0.33 +
          rotation *
            3;

        const score =
          baseScore +
          returnBonus -
          exposurePenalty;

        return {
          game,

          daysUntilRelease,

          attentionScore,

          proximityScore,

          rotation,

          exposure,

          exposurePenalty,

          returnBonus,

          baseScore,

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
   ORDEN POR RELEVANCIA V4

   Importante:
   ahora usamos SCORE FINAL.

   Eso permite que el historial realmente
   afecte qué entra y qué descansa.
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
        second.score !==
        first.score
      ) {
        return (
          second.score -
          first.score
        );
      }

      if (
        second.attentionScore !==
        first.attentionScore
      ) {
        return (
          second.attentionScore -
          first.attentionScore
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
   SELECCIÓN V4

   3 · INMEDIATOS
   3 · CERCANOS
   3 · IMPORTANTES
   1 · COMODÍN
========================================================= */

function selectDailyGames(
  scored,
  limit
) {
  const selected =
    [];

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

  /* -------------------------------------------------------
     INMEDIATOS
  ------------------------------------------------------- */

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

  /* -------------------------------------------------------
     CERCANOS
  ------------------------------------------------------- */

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

  /* -------------------------------------------------------
     IMPORTANTES
  ------------------------------------------------------- */

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

  /* -------------------------------------------------------
     COMODÍN
  ------------------------------------------------------- */

  take(
    scored,
    1,
    "wildcard"
  );

  /* -------------------------------------------------------
     RELLENO
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
   GUARDAR SELECCIÓN DIARIA
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
          "upcoming",

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
          daysUntilRelease:
            item.daysUntilRelease,

          hype:
            numberOrZero(
              item.game.hypes
            ),

          attention:
            Number(
              item.attentionScore.toFixed(
                4
              )
            ),

          proximity:
            Number(
              item.proximityScore.toFixed(
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
            "tierra-vicio-upcoming-v4",
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
   CARGAR SELECCIÓN DE HOY
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

      "&section=eq.upcoming",

      `&selection_date=eq.${dayKey}`,

      "&order=slot.asc",
    ].join("")
  );
}

/* =========================================================
   CARGAR JUEGOS DE UNA SELECCIÓN GUARDADA
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
    .map(
      (row) => {
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
      }
    )
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

    daysUntilRelease:
      metadata.daysUntilRelease ??
      getDaysUntilRelease(
        item.game.first_release_date
      ),

    selectionScore:
      numberOrZero(
        item.row.selection_score
      ),

    signals: {
      hype:
        metadata.hype ??
        numberOrZero(
          item.game.hypes
        ),

      attention:
        metadata.attention ??
        0,

      proximity:
        metadata.proximity ??
        0,

      dailyRotation:
        metadata.dailyRotation ??
        0,

      exposurePenalty:
        metadata.exposurePenalty ??
        0,

      returnBonus:
        metadata.returnBonus ??
        0,

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

    /* =====================================================
       1 · ¿YA EXISTE LA SELECCIÓN DE HOY?
    ===================================================== */

    const todayRows =
      await loadTodaySelection(
        environment,
        dayKey
      );

    /*
     * Para el funcionamiento normal usamos 10.
     *
     * Si ya tenemos suficientes slots guardados,
     * no recalculamos nada.
     */

    if (
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

          persisted:
            true,

          generatedNow:
            false,

          count:
            stored.length,

          selection: {
            algorithm:
              "tierra-vicio-upcoming-v4",

            automatic:
              true,

            dailyRotation:
              true,

            exposureMemory:
              true,

            historyDays:
              HISTORY_DAYS,

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
          },

          games:
            stored.map(
              createStoredSelectionGame
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
      immediate:
        scored.filter(
          (item) =>
            item.daysUntilRelease >= 0 &&
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

        persisted:
          true,

        generatedNow:
          true,

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
            "tierra-vicio-upcoming-v4",

          automatic:
            true,

          dailyRotation:
            true,

          exposureMemory:
            true,

          historyDays:
            HISTORY_DAYS,

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
      "[Tierra Vicio / Actualidad / Upcoming V4]",
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
