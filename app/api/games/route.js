import { NextResponse } from "next/server";

/* =========================================================
   CONFIG
========================================================= */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =========================================================
   VARIABLES DE ENTORNO
========================================================= */

function getEnvironment() {
  const supabaseUrl =
    process.env.SUPABASE_URL;

  const supabaseSecret =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Falta SUPABASE_URL.");
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
   SUPABASE
========================================================= */

async function supabaseGet(
  environment,
  path
) {
  const response = await fetch(
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

function uniqueNumbers(values) {
  return [
    ...new Set(
      values
        .map(Number)
        .filter(
          (value) =>
            Number.isFinite(value) &&
            value > 0
        )
    ),
  ];
}

function parseGameId(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const normalized =
    String(value).trim();

  if (!/^\d+$/.test(normalized)) {
    return NaN;
  }

  const id =
    Number(normalized);

  if (
    !Number.isSafeInteger(id) ||
    id <= 0
  ) {
    return NaN;
  }

  return id;
}

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
    !Number.isSafeInteger(number) ||
    number <= 0
  ) {
    return fallback;
  }

  return number;
}

function cleanSearch(value) {
  if (!value) {
    return "";
  }

  return String(value)
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 100);
}

function escapePostgrestLike(value) {
  return String(value)
    .replace(/[%*_(),]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseBoolean(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return false;
  }

  const normalized =
    String(value)
      .trim()
      .toLowerCase();

  return (
    normalized === "true" ||
    normalized === "1" ||
    normalized === "yes"
  );
}

/* =========================================================
   CAMPOS DE FICHA COMPLETA
========================================================= */

const GAME_SELECT_FIELDS = [
  "id",
  "slug",
  "name",

  "summary",
  "summary_es",

  "storyline",
  "storyline_es",

  "translation_status",
  "translation_source",
  "translation_updated_at",

  "first_release_date",
  "release_year",

  "category",
  "status",
  "release_type",

  "rating",
  "rating_count",
  "total_rating",
  "total_rating_count",
  "hypes",

  "cover_image_id",
  "cover_small_url",
  "cover_medium_url",
  "cover_large_url",

  "developer",
  "publisher",

  "franchise_name",
  "collection_name",

  "checksum",
  "igdb_url",
  "source",
  "active",

  "editorial_summary",

  "freaky_official_score",
  "freaky_official_votes",

  "community_score",
  "community_votes",

  "manual_trailer_youtube_id",
  "manual_trailer_url",

  "data_sources",
  "featured",
].join(",");

/* =========================================================
   CAMPOS LIGEROS

   Se utilizan para:
   - biblioteca
   - buscador
   - próximos lanzamientos
   - tarjetas 2D/3D

   Las relaciones pesadas solo se cargan al abrir
   la ficha completa de un juego.
========================================================= */

const LIGHT_GAME_FIELDS = [
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
   FORMATO LIGERO
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
   CATÁLOGOS RELACIONADOS
========================================================= */

async function loadCatalogRelation({
  environment,
  gameId,
  relationTable,
  relationColumn,
  catalogTable,
}) {
  const relations =
    await supabaseGet(
      environment,
      `${relationTable}?select=${relationColumn}&game_id=eq.${gameId}`
    );

  if (
    !relations ||
    relations.length === 0
  ) {
    return [];
  }

  const ids =
    relations
      .map(
        (item) =>
          item[relationColumn]
      )
      .filter(
        (id) =>
          id !== null &&
          id !== undefined
      );

  if (!ids.length) {
    return [];
  }

  const catalog =
    await supabaseGet(
      environment,
      `${catalogTable}?select=id,name,slug&id=in.(${ids.join(
        ","
      )})`
    );

  const catalogMap =
    new Map(
      catalog.map(
        (item) => [
          item.id,
          item,
        ]
      )
    );

  return ids
    .map(
      (id) =>
        catalogMap.get(id)
    )
    .filter(Boolean);
}

/* =========================================================
   PLATAFORMAS
========================================================= */

async function loadPlatforms(
  environment,
  gameId
) {
  const relations =
    await supabaseGet(
      environment,
      `game_platforms?select=platform_id&game_id=eq.${gameId}`
    );

  if (
    !relations ||
    relations.length === 0
  ) {
    return [];
  }

  const ids =
    relations
      .map(
        (item) =>
          item.platform_id
      )
      .filter(Boolean);

  if (!ids.length) {
    return [];
  }

  const platforms =
    await supabaseGet(
      environment,
      `platforms?select=id,name,abbreviation&id=in.(${ids.join(
        ","
      )})`
    );

  const platformMap =
    new Map(
      platforms.map(
        (platform) => [
          platform.id,
          platform,
        ]
      )
    );

  return ids
    .map(
      (id) =>
        platformMap.get(id)
    )
    .filter(Boolean);
}


/* =========================================================
   PUNTUACIONES OFICIALES POR PLATAFORMA
========================================================= */

async function loadOfficialPlatformScores(
  environment,
  gameId
) {
  try {
    const rows =
      await supabaseGet(
        environment,
        [
          "official_platform_scores",
          "?select=",
          [
            "id",
            "platform_id",
            "source_id",
            "score",
            "votes_count",
            "source_title",
            "source_platform",
            "source_year",
            "source_url",
            "external_reference",
            "active",
          ].join(","),
          `&game_id=eq.${gameId}`,
          "&active=eq.true",
        ].join("")
      );

    if (
      !rows ||
      rows.length === 0
    ) {
      return [];
    }

    const platformIds =
      uniqueNumbers(
        rows.map(
          (item) =>
            item.platform_id
        )
      );

    const sourceIds =
      uniqueNumbers(
        rows.map(
          (item) =>
            item.source_id
        )
      );

    const [
      platforms,
      sources,
    ] =
      await Promise.all([
        platformIds.length
          ? supabaseGet(
              environment,
              `platforms?select=id,name,abbreviation&id=in.(${platformIds.join(
                ","
              )})`
            )
          : Promise.resolve([]),

        sourceIds.length
          ? supabaseGet(
              environment,
              `official_score_sources?select=id,name,slug,active&id=in.(${sourceIds.join(
                ","
              )})`
            )
          : Promise.resolve([]),
      ]);

    const platformMap =
      new Map(
        platforms.map(
          (item) => [
            Number(
              item.id
            ),
            item,
          ]
        )
      );

    const sourceMap =
      new Map(
        sources.map(
          (item) => [
            Number(
              item.id
            ),
            item,
          ]
        )
      );

    return rows
      .map(
        (item) => {
          const platform =
            platformMap.get(
              Number(
                item.platform_id
              )
            );

          const source =
            sourceMap.get(
              Number(
                item.source_id
              )
            );

          if (
            !platform ||
            !source ||
            source.active === false
          ) {
            return null;
          }

          return {
            id:
              item.id,

            score:
              item.score,

            votesCount:
              item.votes_count,

            year:
              item.source_year,

            sourceTitle:
              item.source_title,

            sourcePlatform:
              item.source_platform,

            sourceUrl:
              item.source_url,

            externalReference:
              item.external_reference,

            platform: {
              id:
                platform.id,

              name:
                platform.name,

              abbreviation:
                platform.abbreviation,
            },

            source: {
              id:
                source.id,

              name:
                source.name,

              slug:
                source.slug,
            },
          };
        }
      )
      .filter(Boolean);
  } catch (error) {
    console.error(
      "No se pudieron cargar las puntuaciones oficiales por plataforma:",
      error
    );

    return [];
  }
}

/* =========================================================
   SIMILARES
========================================================= */

async function loadSimilarGames(
  environment,
  gameId
) {
  const relations =
    await supabaseGet(
      environment,
      [
        "game_similar_games",
        "?select=similar_game_id,position",
        `&game_id=eq.${gameId}`,
        "&order=position.asc",
      ].join("")
    );

  if (
    !relations ||
    relations.length === 0
  ) {
    return [];
  }

  const ids =
    uniqueNumbers(
      relations.map(
        (item) =>
          item.similar_game_id
      )
    );

  if (!ids.length) {
    return [];
  }

  const existingGames =
    await supabaseGet(
      environment,
      [
        "games",
        "?select=",
        [
          "id",
          "slug",
          "name",
          "release_year",
          "developer",
          "publisher",
          "cover_image_id",
          "cover_small_url",
          "cover_medium_url",
          "cover_large_url",
          "rating",
          "rating_count",
          "total_rating",
          "total_rating_count",
          "freaky_official_score",
          "community_score",
          "active",
        ].join(","),
        `&id=in.(${ids.join(",")})`,
      ].join("")
    );

  const gameMap =
    new Map(
      existingGames.map(
        (game) => [
          Number(game.id),
          game,
        ]
      )
    );

  return relations.map(
    (relation) => {
      const id =
        Number(
          relation.similar_game_id
        );

      const game =
        gameMap.get(id);

      if (!game) {
        return {
          id,
          position:
            relation.position,
          available:
            false,
        };
      }

      return {
        id:
          game.id,

        slug:
          game.slug,

        name:
          game.name,

        year:
          game.release_year,

        developer:
          game.developer,

        publisher:
          game.publisher,

        cover: {
          imageId:
            game.cover_image_id,

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

        communityScore:
          game.community_score,

        active:
          game.active,

        position:
          relation.position,

        available:
          true,
      };
    }
  );
}

/* =========================================================
   FICHA COMPLETA
========================================================= */
/* =========================================================
   FICHA COMPLETA
========================================================= */

async function loadCompleteGame(
  environment,
  game
) {
  const [
    platforms,
    officialPlatformScores,
    videos,
    screenshots,
    artworks,
    alternativeNames,
    genres,
    themes,
    gameModes,
    perspectives,
    engines,
    websites,
    similarGames,
    ageRatings,
    languages,
  ] = await Promise.all([
    loadPlatforms(
      environment,
      game.id
    ),

    loadOfficialPlatformScores(
      environment,
      game.id
    ),

    supabaseGet(
      environment,
      `game_videos?select=id,name,youtube_id,youtube_url,position&game_id=eq.${game.id}&order=position.asc`
    ),

    supabaseGet(
      environment,
      `game_screenshots?select=id,image_id,image_url,position&game_id=eq.${game.id}&order=position.asc`
    ),

    supabaseGet(
      environment,
      `game_artworks?select=id,image_id,image_url,position&game_id=eq.${game.id}&order=position.asc`
    ),

    supabaseGet(
      environment,
      `game_alternative_names?select=id,name,comment,position&game_id=eq.${game.id}&order=position.asc`
    ),

    loadCatalogRelation({
      environment,
      gameId:
        game.id,
      relationTable:
        "game_genres",
      relationColumn:
        "genre_id",
      catalogTable:
        "genres",
    }),

    loadCatalogRelation({
      environment,
      gameId:
        game.id,
      relationTable:
        "game_themes",
      relationColumn:
        "theme_id",
      catalogTable:
        "themes",
    }),

    loadCatalogRelation({
      environment,
      gameId:
        game.id,
      relationTable:
        "game_game_modes",
      relationColumn:
        "game_mode_id",
      catalogTable:
        "game_modes",
    }),

    loadCatalogRelation({
      environment,
      gameId:
        game.id,
      relationTable:
        "game_player_perspectives",
      relationColumn:
        "perspective_id",
      catalogTable:
        "player_perspectives",
    }),

    loadCatalogRelation({
      environment,
      gameId:
        game.id,
      relationTable:
        "game_game_engines",
      relationColumn:
        "engine_id",
      catalogTable:
        "game_engines",
    }),

    supabaseGet(
      environment,
      `game_websites?select=id,category,url,trusted,position&game_id=eq.${game.id}&order=position.asc`
    ),

    loadSimilarGames(
      environment,
      game.id
    ),

    supabaseGet(
      environment,
      `game_age_ratings?select=id,organization,rating,synopsis,content_descriptors&game_id=eq.${game.id}`
    ),

    supabaseGet(
      environment,
      `game_languages?select=id,language_id,language_name,native_name,audio,subtitles,interface&game_id=eq.${game.id}`
    ),
  ]);

  const displaySummary =
    game.summary_es ||
    game.summary ||
    null;

  const displayStoryline =
    game.storyline_es ||
    game.storyline ||
    null;

  return {
    id:
      game.id,

    slug:
      game.slug,

    name:
      game.name,

    summary:
      displaySummary,

    summaryOriginal:
      game.summary,

    summaryEs:
      game.summary_es,

    storyline:
      displayStoryline,

    storylineOriginal:
      game.storyline,

    storylineEs:
      game.storyline_es,

    editorialSummary:
      game.editorial_summary,

    translation: {
      status:
        game.translation_status ||
        null,

      source:
        game.translation_source ||
        null,

      updatedAt:
        game.translation_updated_at ||
        null,

      hasSpanishSummary:
        Boolean(
          game.summary_es
        ),

      hasSpanishStoryline:
        Boolean(
          game.storyline_es
        ),
    },

    releaseDate:
      game.first_release_date,

    year:
      game.release_year,

    category:
      game.category,

    status:
      game.status,

    releaseType:
      game.release_type,

    developer:
      game.developer,

    publisher:
      game.publisher,

    franchise:
      game.franchise_name,

    collection:
      game.collection_name,

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

    cover: {
      imageId:
        game.cover_image_id,

      small:
        game.cover_small_url,

      medium:
        game.cover_medium_url,

      large:
        game.cover_large_url,
    },

    platforms,

    officialPlatformScores,

    genres,

    themes,

    gameModes,

    playerPerspectives:
      perspectives,

    gameEngines:
      engines,

    videos:
      videos.map(
        (video) => ({
          id:
            video.id,

          name:
            video.name,

          youtubeId:
            video.youtube_id,

          youtubeUrl:
            video.youtube_url,

          position:
            video.position,
        })
      ),

    manualTrailer:
      game.manual_trailer_youtube_id ||
      game.manual_trailer_url
        ? {
            youtubeId:
              game.manual_trailer_youtube_id,

            url:
              game.manual_trailer_url,
          }
        : null,

    screenshots:
      screenshots.map(
        (screenshot) => ({
          id:
            screenshot.id,

          imageId:
            screenshot.image_id,

          url:
            screenshot.image_url,

          position:
            screenshot.position,
        })
      ),

    artworks:
      artworks.map(
        (artwork) => ({
          id:
            artwork.id,

          imageId:
            artwork.image_id,

          url:
            artwork.image_url,

          position:
            artwork.position,
        })
      ),

    alternativeNames:
      alternativeNames.map(
        (item) => ({
          id:
            item.id,

          name:
            item.name,

          comment:
            item.comment,

          position:
            item.position,
        })
      ),

    ageRatings:
      ageRatings.map(
        (item) => ({
          id:
            item.id,

          organization:
            item.organization,

          rating:
            item.rating,

          synopsis:
            item.synopsis,

          contentDescriptors:
            item.content_descriptors ||
            [],
        })
      ),

    languages:
      languages.map(
        (item) => ({
          id:
            item.id,

          languageId:
            item.language_id,

          name:
            item.language_name,

          nativeName:
            item.native_name,

          audio:
            item.audio,

          subtitles:
            item.subtitles,

          interface:
            item.interface,
        })
      ),

    websites:
      websites.map(
        (website) => ({
          id:
            website.id,

          category:
            website.category,

          url:
            website.url,

          trusted:
            website.trusted,

          position:
            website.position,
        })
      ),

    similarGames,

    igdbUrl:
      game.igdb_url,

    checksum:
      game.checksum,

    source:
      game.source,

    dataSources:
      game.data_sources ||
      {},

    featured:
      game.featured,

    active:
      game.active,
  };
}

/* =========================================================
   FICHA POR ID
========================================================= */

async function getGameById(
  environment,
  id
) {
  const games =
    await supabaseGet(
      environment,
      [
        "games",
        "?select=",
        GAME_SELECT_FIELDS,
        `&id=eq.${id}`,
        "&limit=1",
      ].join("")
    );

  if (
    !games ||
    games.length === 0
  ) {
    return null;
  }

  return loadCompleteGame(
    environment,
    games[0]
  );
}

/* =========================================================
   BIBLIOTECA LIGERA

   Nunca construye fichas completas.

   Se utiliza para:
   - biblioteca
   - búsqueda

   Populares y Próximos mantienen
   sus propias reglas.
========================================================= */

async function getLibrary({
  environment,
  search,
  page,
  limit,
}) {
  const offset =
    (page - 1) * limit;

  const fetchLimit =
    limit + 1;

  const parts = [
    "games",
    "?select=",
    LIGHT_GAME_FIELDS,
    "&active=eq.true",
  ];

  if (search) {
    const safeSearch =
      escapePostgrestLike(search);

    if (safeSearch) {
      parts.push(
        `&name=ilike.*${encodeURIComponent(
          safeSearch
        )}*`
      );
    }
  }

  if (search) {
    parts.push(
      "&order=name.asc,id.asc"
    );
  } else {
    parts.push(
      "&order=total_rating_count.desc.nullslast,id.asc"
    );
  }

  parts.push(
    `&offset=${offset}`
  );

  parts.push(
    `&limit=${fetchLimit}`
  );

  const rows =
    await supabaseGet(
      environment,
      parts.join("")
    );

  const hasMore =
    rows.length > limit;

  const visibleRows =
    hasMore
      ? rows.slice(0, limit)
      : rows;

  return {
    games:
      visibleRows.map(
        createLightGame
      ),

    pagination: {
      page,

      limit,

      returned:
        visibleRows.length,

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
  };
}

/* =========================================================
   PRÓXIMOS LANZAMIENTOS

   IMPORTANTE:
   - consulta directamente Supabase
   - no descarga la biblioteca completa
   - solo devuelve campos ligeros
   - ordena cronológicamente
   - admite paginación
========================================================= */

async function getUpcomingGames({
  environment,
  page,
  limit,
}) {
  const offset =
    (page - 1) * limit;

  const fetchLimit =
    limit + 1;

  /*
   * IGDB guarda first_release_date como
   * timestamp Unix en segundos.
   *
   * Calculamos "ahora" una sola vez para
   * que PostgreSQL haga el filtrado.
   */

    const nowIso =
    new Date().toISOString();

  const rows =
    await supabaseGet(
      environment,
      [
        "games",
        "?select=",
        LIGHT_GAME_FIELDS,

        "&active=eq.true",

        "&first_release_date=not.is.null",

      `&first_release_date=gt.${encodeURIComponent(
          nowIso
        )}`,     

        "&order=first_release_date.asc,id.asc",

        `&offset=${offset}`,

        `&limit=${fetchLimit}`,
      ].join("")
    );

  const hasMore =
    rows.length > limit;

  const visibleRows =
    hasMore
      ? rows.slice(0, limit)
      : rows;

  return {
    games:
      visibleRows.map(
        createLightGame
      ),

    pagination: {
      page,

      limit,

      returned:
        visibleRows.length,

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
  };
}

/* =========================================================
   GET /api/games

   FICHA COMPLETA
   /api/games?id=40

   BIBLIOTECA
   /api/games

   BIBLIOTECA PAGINADA
   /api/games?page=2&limit=24

   BÚSQUEDA
   /api/games?search=mafia

   BÚSQUEDA PAGINADA
   /api/games?search=resident&page=2&limit=20

   PRÓXIMOS
   /api/games?upcoming=true

   PRÓXIMOS PAGINADOS
   /api/games?upcoming=true&page=2&limit=20
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
       ID
    ===================================================== */

    const requestedId =
      parseGameId(
        searchParams.get(
          "id"
        )
      );

    if (
      Number.isNaN(
        requestedId
      )
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          error:
            "El parámetro id debe ser un ID numérico válido.",
        },
        {
          status:
            400,
        }
      );
    }

    /* =====================================================
       FICHA COMPLETA

       Tiene prioridad sobre cualquier otro parámetro.
    ===================================================== */

    if (
      requestedId !== null
    ) {
      const game =
        await getGameById(
          environment,
          requestedId
        );

      if (!game) {
        return NextResponse.json(
          {
            ok:
              false,

            found:
              false,

            id:
              requestedId,

            error:
              `El juego ${requestedId} no existe todavía en la biblioteca de Tierra Vicio.`,
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

      return NextResponse.json(
        {
          ok:
            true,

          found:
            true,

          source:
            "Tierra Vicio Database",

          game,
        },
        {
          status:
            200,

          headers: {
            "Cache-Control":
              "no-store, max-age=0",
          },
        }
      );
    }

    /* =====================================================
       MODOS LIGEROS
    ===================================================== */

    const upcoming =
      parseBoolean(
        searchParams.get(
          "upcoming"
        )
      );

    const search =
      cleanSearch(
        searchParams.get(
          "search"
        ) ||
        searchParams.get(
          "q"
        )
      );

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

      /*
     * Límites según el tipo de consulta.
     *
     * Búsqueda:
     * máximo 20.
     *
     * Próximos:
     * máximo 50.
     *
     * Biblioteca:
     * máximo 50.
     */

    const requestedLimit =
      parsePositiveInteger(
        searchParams.get(
          "limit"
        ),
        search
          ? 20
          : upcoming
            ? 20
            : 24
      );

    const maxLimit =
      search
        ? 20
        : 50;

    const limit =
      Math.min(
        requestedLimit,
        maxLimit
      );

    /* =====================================================
       PRÓXIMOS LANZAMIENTOS

       Tiene prioridad sobre biblioteca/búsqueda.

       No construye fichas completas.
    ===================================================== */

    if (upcoming) {
      const result =
        await getUpcomingGames({
          environment,
          page,
          limit,
        });

      return NextResponse.json(
        {
          ok:
            true,

          source:
            "Tierra Vicio Database",

          mode:
            "upcoming",

          count:
            result.games.length,

          pagination:
            result.pagination,

          games:
            result.games,
        },
        {
          status:
            200,

          headers: {
            /*
             * Los próximos lanzamientos no necesitan
             * recalcularse en cada visita.
             *
             * Vercel puede reutilizar esta respuesta
             * durante 5 minutos y servir una versión
             * anterior mientras la renueva.
             */

            "Cache-Control":
              "public, s-maxage=300, stale-while-revalidate=1800",
          },
        }
      );
    }

    /* =====================================================
       BIBLIOTECA / BUSCADOR
    ===================================================== */

    const result =
      await getLibrary({
        environment,
        search,
        page,
        limit,
      });

    return NextResponse.json(
      {
        ok:
          true,

        source:
          "Tierra Vicio Database",

        mode:
          search
            ? "search"
            : "library",

        query:
          search ||
          null,

        count:
          result.games.length,

        pagination:
          result.pagination,

        games:
          result.games,
      },
      {
        status:
          200,

        headers: {
          "Cache-Control":
            "public, s-maxage=30, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error(
      "[Tierra Vicio / Games API]",
      error
    );

    return NextResponse.json(
      {
        ok:
          false,

        error:
          error instanceof Error
            ? error.message
            : "Error desconocido leyendo la base de datos.",
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
