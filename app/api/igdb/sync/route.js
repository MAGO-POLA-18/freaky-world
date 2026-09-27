import { NextResponse } from "next/server";

/* =========================================================
   CONFIG
========================================================= */

const TWITCH_TOKEN_URL =
  "https://id.twitch.tv/oauth2/token";

const IGDB_GAMES_URL =
  "https://api.igdb.com/v4/games";

const DEFAULT_BATCH_SIZE = 25;
const MAX_BATCH_SIZE = 50;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =========================================================
   VARIABLES DE ENTORNO
========================================================= */

function getEnvironment() {
  const igdbClientId =
    process.env.IGDB_CLIENT_ID;

  const igdbClientSecret =
    process.env.IGDB_CLIENT_SECRET;

  const supabaseUrl =
    process.env.SUPABASE_URL;

  const supabaseSecret =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!igdbClientId) {
    throw new Error(
      "Falta IGDB_CLIENT_ID."
    );
  }

  if (!igdbClientSecret) {
    throw new Error(
      "Falta IGDB_CLIENT_SECRET."
    );
  }

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
    igdbClientId,
    igdbClientSecret,

    supabaseUrl:
      supabaseUrl.replace(/\/+$/, ""),

    supabaseSecret,
  };
}

/* =========================================================
   TOKEN TWITCH
========================================================= */

async function getTwitchAccessToken(
  clientId,
  clientSecret
) {
  const url =
    `${TWITCH_TOKEN_URL}` +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&client_secret=${encodeURIComponent(clientSecret)}` +
    `&grant_type=client_credentials`;

  const response =
    await fetch(url, {
      method: "POST",
      cache: "no-store",
    });

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `Twitch OAuth respondió ${response.status}: ${errorText}`
    );
  }

  const data =
    await response.json();

  if (!data.access_token) {
    throw new Error(
      "Twitch no devolvió access_token."
    );
  }

  return data.access_token;
}

/* =========================================================
   CAMPOS IGDB
========================================================= */

const IGDB_FIELDS = `
  id,
  name,
  slug,
  summary,
  storyline,

  game_type.id,
  game_type.type,

  game_status.id,
  game_status.status,

  parent_game.id,
  parent_game.name,

  version_parent.id,
  version_parent.name,
  version_title,

  first_release_date,

  rating,
  rating_count,
  total_rating,
  total_rating_count,
  hypes,

  url,
  checksum,

  cover.image_id,
  cover.width,
  cover.height,

  platforms.id,
  platforms.name,
  platforms.abbreviation,

  involved_companies.company.name,
  involved_companies.developer,
  involved_companies.publisher,

  videos.video_id,
  videos.name,

  screenshots.image_id,

  artworks.image_id,

  alternative_names.name,
  alternative_names.comment,

  genres.id,
  genres.name,
  genres.slug,

  themes.id,
  themes.name,
  themes.slug,

  game_modes.id,
  game_modes.name,
  game_modes.slug,

  player_perspectives.id,
  player_perspectives.name,
  player_perspectives.slug,

  game_engines.id,
  game_engines.name,
  game_engines.slug,

  franchises.id,
  franchises.name,

  collections.id,
  collections.name,

  websites.category,
  websites.url,
  websites.trusted,

  similar_games,

  age_ratings.organization.id,
  age_ratings.organization.name,
  age_ratings.rating_category.id,
  age_ratings.rating_category.rating,
  age_ratings.rating_content_descriptions.id,
  age_ratings.rating_content_descriptions.description,
  age_ratings.synopsis,

  language_supports.language.id,
  language_supports.language.name,
  language_supports.language.native_name,
  language_supports.language.locale,
  language_supports.language_support_type.id,
  language_supports.language_support_type.name
`;

/* =========================================================
   LLAMADA GENÉRICA A IGDB
========================================================= */

async function requestIGDBGames(
  accessToken,
  clientId,
  query
) {
  const response =
    await fetch(
      IGDB_GAMES_URL,
      {
        method: "POST",

        headers: {
          "Client-ID":
            clientId,

          Authorization:
            `Bearer ${accessToken}`,

          Accept:
            "application/json",

          "Content-Type":
            "text/plain",
        },

        body: query,

        cache:
          "no-store",
      }
    );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `IGDB respondió ${response.status}: ${errorText}`
    );
  }

  const data =
    await response.json();

  return Array.isArray(data)
    ? data
    : [];
}

/* =========================================================
   SINCRONIZACIÓN GENERAL ORIGINAL
========================================================= */

async function getGamesFromIGDB(
  accessToken,
  clientId
) {
  const now =
    Math.floor(
      Date.now() / 1000
    );

  const query = `
    fields
      ${IGDB_FIELDS};

    where
      cover != null
      & first_release_date != null
      & first_release_date <= ${now}
      & total_rating_count > 20;

    sort total_rating_count desc;

    limit 10;
  `;

  return requestIGDBGames(
    accessToken,
    clientId,
    query
  );
}

/* =========================================================
   IMPORTACIÓN INDIVIDUAL
========================================================= */

async function getGameFromIGDBById(
  accessToken,
  clientId,
  gameId
) {
  const query = `
    fields
      ${IGDB_FIELDS};

    where id = ${gameId};

    limit 1;
  `;

  const games =
    await requestIGDBGames(
      accessToken,
      clientId,
      query
    );

  return games[0] || null;
}

/* =========================================================
   IMPORTACIÓN MASIVA

   Se pagina por ID, no por "offset" real de IGDB.

   Esto permite reanudar:
   ?mode=bulk&after=12345&limit=25

   La siguiente llamada usa nextAfter.
========================================================= */

async function getBulkGamesFromIGDB(
  accessToken,
  clientId,
  after,
  limit
) {
  const now =
    Math.floor(
      Date.now() / 1000
    );

  const query = `
    fields
      ${IGDB_FIELDS};

    where
      id > ${after}
      & cover != null
      & first_release_date != null
      & first_release_date <= ${now};

    sort id asc;

    limit ${limit};
  `;

  return requestIGDBGames(
    accessToken,
    clientId,
    query
  );
}

/* =========================================================
   HELPERS
========================================================= */

function cleanArray(value) {
  return Array.isArray(value)
    ? value.filter(Boolean)
    : [];
}

function uniqueById(items) {
  const map =
    new Map();

  for (const item of items) {
    if (
      item &&
      item.id !== undefined &&
      item.id !== null
    ) {
      map.set(
        item.id,
        item
      );
    }
  }

  return [
    ...map.values(),
  ];
}

function normalizeSupportTypeName(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function getLanguageSupportFlags(
  supports
) {
  const flags = {
    audio: false,
    subtitles: false,
    interface: false,
  };

  for (const support of supports) {
    const typeName =
      normalizeSupportTypeName(
        support
          ?.language_support_type
          ?.name
      );

    if (
      typeName.includes(
        "audio"
      )
    ) {
      flags.audio = true;
    }

    if (
      typeName.includes(
        "subtitle"
      )
    ) {
      flags.subtitles = true;
    }

    if (
      typeName.includes(
        "interface"
      )
    ) {
      flags.interface = true;
    }
  }

  return flags;
}

/* =========================================================
   NORMALIZAR JUEGO
========================================================= */

function normalizeGame(game) {
  const releaseDate =
    game.first_release_date
      ? new Date(
          game.first_release_date *
            1000
        )
      : null;

  const developers =
    cleanArray(
      game.involved_companies
    )
      .filter(
        (item) =>
          item.developer &&
          item.company?.name
      )
      .map(
        (item) =>
          item.company.name
      );

  const publishers =
    cleanArray(
      game.involved_companies
    )
      .filter(
        (item) =>
          item.publisher &&
          item.company?.name
      )
      .map(
        (item) =>
          item.company.name
      );

  const platforms =
    uniqueById(
      cleanArray(
        game.platforms
      ).map(
        (platform) => ({
          id:
            platform.id,

          name:
            platform.name,

          abbreviation:
            platform.abbreviation ||
            null,
        })
      )
    );

  const videos =
    cleanArray(
      game.videos
    )
      .filter(
        (video) =>
          video.video_id
      )
      .map(
        (
          video,
          index
        ) => ({
          name:
            video.name ||
            null,

          youtubeId:
            video.video_id,

          youtubeUrl:
            `https://www.youtube.com/watch?v=${video.video_id}`,

          position:
            index,
        })
      );

  const screenshots =
    cleanArray(
      game.screenshots
    )
      .filter(
        (screenshot) =>
          screenshot.image_id
      )
      .map(
        (
          screenshot,
          index
        ) => ({
          imageId:
            screenshot.image_id,

          imageUrl:
            `https://images.igdb.com/igdb/image/upload/t_screenshot_big/${screenshot.image_id}.jpg`,

          position:
            index,
        })
      );

  const artworks =
    cleanArray(
      game.artworks
    )
      .filter(
        (artwork) =>
          artwork.image_id
      )
      .map(
        (
          artwork,
          index
        ) => ({
          imageId:
            artwork.image_id,

          imageUrl:
            `https://images.igdb.com/igdb/image/upload/t_1080p/${artwork.image_id}.jpg`,

          position:
            index,
        })
      );

  const alternativeNames =
    cleanArray(
      game.alternative_names
    )
      .filter(
        (item) =>
          item.name
      )
      .map(
        (
          item,
          index
        ) => ({
          name:
            item.name,

          comment:
            item.comment ||
            null,

          position:
            index,
        })
      );

  const genres =
    uniqueById(
      cleanArray(
        game.genres
      ).map(
        (item) => ({
          id:
            item.id,

          name:
            item.name,

          slug:
            item.slug ||
            null,
        })
      )
    );

  const themes =
    uniqueById(
      cleanArray(
        game.themes
      ).map(
        (item) => ({
          id:
            item.id,

          name:
            item.name,

          slug:
            item.slug ||
            null,
        })
      )
    );

  const gameModes =
    uniqueById(
      cleanArray(
        game.game_modes
      ).map(
        (item) => ({
          id:
            item.id,

          name:
            item.name,

          slug:
            item.slug ||
            null,
        })
      )
    );

  const perspectives =
    uniqueById(
      cleanArray(
        game.player_perspectives
      ).map(
        (item) => ({
          id:
            item.id,

          name:
            item.name,

          slug:
            item.slug ||
            null,
        })
      )
    );

  const engines =
    uniqueById(
      cleanArray(
        game.game_engines
      ).map(
        (item) => ({
          id:
            item.id,

          name:
            item.name,

          slug:
            item.slug ||
            null,
        })
      )
    );

  const franchises =
    uniqueById(
      cleanArray(
        game.franchises
      ).map(
        (item) => ({
          id:
            item.id,

          name:
            item.name,
        })
      )
    );

  const collections =
    uniqueById(
      cleanArray(
        game.collections
      ).map(
        (item) => ({
          id:
            item.id,

          name:
            item.name,
        })
      )
    );

  const websites =
    cleanArray(
      game.websites
    )
      .filter(
        (website) =>
          website.url
      )
      .map(
        (
          website,
          index
        ) => ({
          category:
            website.category ??
            null,

          url:
            website.url,

          trusted:
            website.trusted ??
            null,

          position:
            index,
        })
      );

  const similarGames =
    cleanArray(
      game.similar_games
    )
      .map(
        (item) =>
          typeof item ===
          "object"
            ? item?.id
            : item
      )
      .filter(
        (id) =>
          Number.isFinite(id)
      )
      .map(
        (
          id,
          index
        ) => ({
          id,
          position:
            index,
        })
      );

  const ageRatings =
    cleanArray(
      game.age_ratings
    ).map(
      (item) => ({
        organization:
          item.organization
            ?.name ||
          null,

        organizationId:
          item.organization
            ?.id ??
          null,

        rating:
          item.rating_category
            ?.rating ||
          null,

        ratingCategoryId:
          item.rating_category
            ?.id ??
          null,

        synopsis:
          item.synopsis ||
          null,

        contentDescriptors:
          cleanArray(
            item
              .rating_content_descriptions
          )
            .map(
              (descriptor) =>
                descriptor
                  ?.description
            )
            .filter(Boolean),
      })
    );

  const languageGroups =
    new Map();

  for (
    const support of cleanArray(
      game.language_supports
    )
  ) {
    const language =
      support.language;

    if (
      !language?.id
    ) {
      continue;
    }

    if (
      !languageGroups.has(
        language.id
      )
    ) {
      languageGroups.set(
        language.id,
        {
          language,
          supports: [],
        }
      );
    }

    languageGroups
      .get(
        language.id
      )
      .supports.push(
        support
      );
  }

  const languages =
    [
      ...languageGroups.values(),
    ].map(
      ({
        language,
        supports,
      }) => {
        const flags =
          getLanguageSupportFlags(
            supports
          );

        return {
          languageId:
            language.id,

          languageName:
            language.name ||
            null,

          nativeName:
            language.native_name ||
            null,

          locale:
            language.locale ||
            null,

          audio:
            flags.audio,

          subtitles:
            flags.subtitles,

          interface:
            flags.interface,
        };
      }
    );

  const gameType =
    game.game_type ||
    null;

  const gameStatus =
    game.game_status ||
    null;

  const parentGame =
    game.parent_game ||
    null;

  const versionParent =
    game.version_parent ||
    null;

  return {
    id:
      game.id,

    slug:
      game.slug ||
      null,

    name:
      game.name,

    summary:
      game.summary ||
      null,

    storyline:
      game.storyline ||
      null,

    category:
      gameType?.id ??
      null,

    releaseType:
      gameType?.type ||
      null,

    status:
      gameStatus?.id ??
      null,

    gameStatusName:
      gameStatus?.status ||
      null,

    parentGameId:
      parentGame?.id ??
      null,

    parentGameName:
      parentGame?.name ||
      null,

    versionParentId:
      versionParent?.id ??
      null,

    versionParentName:
      versionParent?.name ||
      null,

    versionTitle:
      game.version_title ||
      null,

    firstReleaseDate:
      releaseDate
        ? releaseDate.toISOString()
        : null,

    releaseYear:
      releaseDate
        ? releaseDate.getUTCFullYear()
        : null,

    rating:
      typeof game.rating ===
      "number"
        ? Number(
            game.rating.toFixed(
              2
            )
          )
        : null,

    ratingCount:
      game.rating_count ||
      0,

    totalRating:
      typeof game.total_rating ===
      "number"
        ? Number(
            game.total_rating.toFixed(
              2
            )
          )
        : null,

    totalRatingCount:
      game.total_rating_count ||
      0,

    hypes:
      game.hypes ||
      0,

    checksum:
      game.checksum ||
      null,

    igdbUrl:
      game.url ||
      null,

    coverImageId:
      game.cover?.image_id ||
      null,

    coverSmallUrl:
      game.cover?.image_id
        ? `https://images.igdb.com/igdb/image/upload/t_cover_small/${game.cover.image_id}.jpg`
        : null,

    coverMediumUrl:
      game.cover?.image_id
        ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
        : null,

    coverLargeUrl:
      game.cover?.image_id
        ? `https://images.igdb.com/igdb/image/upload/t_720p/${game.cover.image_id}.jpg`
        : null,

    developer:
      developers[0] ||
      null,

    publisher:
      publishers[0] ||
      null,

    franchiseName:
      franchises[0]
        ?.name ||
      null,

    collectionName:
      collections[0]
        ?.name ||
      null,

    platforms,
    videos,
    screenshots,
    artworks,
    alternativeNames,
    genres,
    themes,
    gameModes,
    perspectives,
    engines,
    franchises,
    collections,
    websites,
    similarGames,
    ageRatings,
    languages,
  };
}

/* =========================================================
   SUPABASE REST
========================================================= */

async function supabaseRequest(
  environment,
  path,
  options = {}
) {
  const response =
    await fetch(
      `${environment.supabaseUrl}/rest/v1/${path}`,
      {
        ...options,

        headers: {
          apikey:
            environment.supabaseSecret,

          Authorization:
            `Bearer ${environment.supabaseSecret}`,

          "Content-Type":
            "application/json",

          Prefer:
            options.prefer ||
            "return=minimal",

          ...(options.headers ||
            {}),
        },

        cache:
          "no-store",
      }
    );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `Supabase ${path} respondió ${response.status}: ${errorText}`
    );
  }

  const text =
    await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(
      text
    );
  } catch {
    return text;
  }
}

/* =========================================================
   COMPROBAR SI EXISTE
========================================================= */

async function gameExists(
  environment,
  gameId
) {
  const result =
    await supabaseRequest(
      environment,
      `games?id=eq.${gameId}&select=id,name`,
      {
        method:
          "GET",

        prefer:
          "return=representation",
      }
    );

  return (
    Array.isArray(result) &&
    result.length > 0
  );
}

/* =========================================================
   REEMPLAZAR RELACIONES
========================================================= */

async function deleteGameRelations(
  environment,
  table,
  gameId
) {
  await supabaseRequest(
    environment,
    `${table}?game_id=eq.${gameId}`,
    {
      method:
        "DELETE",
    }
  );
}

/* =========================================================
   GUARDAR JUEGO

   NO SE TOCAN:
   - summary_es
   - storyline_es
   - translation_status
   - translation_source
   - translation_updated_at
   - freaky_official_score
   - freaky_official_votes
   - community_score
   - community_votes
   - editorial_summary
   - featured
   - hidden
   - manual_trailer_youtube_id
   - manual_trailer_url
========================================================= */

async function saveGame(
  environment,
  game
) {
  const gameRow = {
    id:
      game.id,

    slug:
      game.slug,

    name:
      game.name,

    summary:
      game.summary,

    storyline:
      game.storyline,

    category:
      game.category,

    status:
      game.status,

    release_type:
      game.releaseType,

    parent_game_id:
      game.parentGameId,

    version_parent_id:
      game.versionParentId,

    first_release_date:
      game.firstReleaseDate,

    release_year:
      game.releaseYear,

    rating:
      game.rating,

    rating_count:
      game.ratingCount,

    total_rating:
      game.totalRating,

    total_rating_count:
      game.totalRatingCount,

    hypes:
      game.hypes,

    cover_image_id:
      game.coverImageId,

    cover_small_url:
      game.coverSmallUrl,

    cover_medium_url:
      game.coverMediumUrl,

    cover_large_url:
      game.coverLargeUrl,

    developer:
      game.developer,

    publisher:
      game.publisher,

    franchise_name:
      game.franchiseName,

    collection_name:
      game.collectionName,

    checksum:
      game.checksum,

    igdb_url:
      game.igdbUrl,

    source:
      "IGDB",

    active:
      true,

    updated_at:
      new Date().toISOString(),
  };

  await supabaseRequest(
    environment,
    "games?on_conflict=id",
    {
      method:
        "POST",

      prefer:
        "resolution=merge-duplicates,return=minimal",

      body:
        JSON.stringify(
          [gameRow]
        ),
    }
  );
}

/* =========================================================
   GUARDAR PLATAFORMAS
========================================================= */

async function savePlatforms(
  environment,
  game
) {
  if (
    game.platforms.length
  ) {
    const rows =
      game.platforms.map(
        (platform) => ({
          id:
            platform.id,

          name:
            platform.name,

          abbreviation:
            platform.abbreviation,

          updated_at:
            new Date().toISOString(),
        })
      );

    await supabaseRequest(
      environment,
      "platforms?on_conflict=id",
      {
        method:
          "POST",

        prefer:
          "resolution=merge-duplicates,return=minimal",

        body:
          JSON.stringify(
            rows
          ),
      }
    );
  }

  await deleteGameRelations(
    environment,
    "game_platforms",
    game.id
  );

  if (
    !game.platforms.length
  ) {
    return;
  }

  const relationRows =
    game.platforms.map(
      (platform) => ({
        game_id:
          game.id,

        platform_id:
          platform.id,
      })
    );

  await supabaseRequest(
    environment,
    "game_platforms?on_conflict=game_id,platform_id",
    {
      method:
        "POST",

      prefer:
        "resolution=merge-duplicates,return=minimal",

      body:
        JSON.stringify(
          relationRows
        ),
    }
  );
}

/* =========================================================
   GUARDAR VIDEOS
========================================================= */

async function saveVideos(
  environment,
  game
) {
  await deleteGameRelations(
    environment,
    "game_videos",
    game.id
  );

  if (
    !game.videos.length
  ) {
    return;
  }

  const rows =
    game.videos.map(
      (video) => ({
        game_id:
          game.id,

        name:
          video.name,

        youtube_id:
          video.youtubeId,

        youtube_url:
          video.youtubeUrl,

        position:
          video.position,
      })
    );

  await supabaseRequest(
    environment,
    "game_videos?on_conflict=game_id,youtube_id",
    {
      method:
        "POST",

      prefer:
        "resolution=merge-duplicates,return=minimal",

      body:
        JSON.stringify(
          rows
        ),
    }
  );
}

/* =========================================================
   GUARDAR SCREENSHOTS
========================================================= */

async function saveScreenshots(
  environment,
  game
) {
  await deleteGameRelations(
    environment,
    "game_screenshots",
    game.id
  );

  if (
    !game.screenshots.length
  ) {
    return;
  }

  const rows =
    game.screenshots.map(
      (screenshot) => ({
        game_id:
          game.id,

        image_id:
          screenshot.imageId,

        image_url:
          screenshot.imageUrl,

        position:
          screenshot.position,
      })
    );

  await supabaseRequest(
    environment,
    "game_screenshots?on_conflict=game_id,image_id",
    {
      method:
        "POST",

      prefer:
        "resolution=merge-duplicates,return=minimal",

      body:
        JSON.stringify(
          rows
        ),
    }
  );
}

/* =========================================================
   GUARDAR ARTWORKS
========================================================= */

async function saveArtworks(
  environment,
  game
) {
  await deleteGameRelations(
    environment,
    "game_artworks",
    game.id
  );

  if (
    !game.artworks.length
  ) {
    return;
  }

  const rows =
    game.artworks.map(
      (artwork) => ({
        game_id:
          game.id,

        image_id:
          artwork.imageId,

        image_url:
          artwork.imageUrl,

        position:
          artwork.position,
      })
    );

  await supabaseRequest(
    environment,
    "game_artworks?on_conflict=game_id,image_id",
    {
      method:
        "POST",

      prefer:
        "resolution=merge-duplicates,return=minimal",

      body:
        JSON.stringify(
          rows
        ),
    }
  );
}

/* =========================================================
   GUARDAR NOMBRES ALTERNATIVOS
========================================================= */

async function saveAlternativeNames(
  environment,
  game
) {
  await deleteGameRelations(
    environment,
    "game_alternative_names",
    game.id
  );

  if (
    !game.alternativeNames.length
  ) {
    return;
  }

  const rows =
    game.alternativeNames.map(
      (item) => ({
        game_id:
          game.id,

        name:
          item.name,

        comment:
          item.comment,

        position:
          item.position,
      })
    );

  await supabaseRequest(
    environment,
    "game_alternative_names",
    {
      method:
        "POST",

      body:
        JSON.stringify(
          rows
        ),
    }
  );
}

/* =========================================================
   GUARDAR CATÁLOGO + RELACIÓN
========================================================= */

async function saveCatalogRelation({
  environment,
  gameId,
  items,
  catalogTable,
  relationTable,
  relationColumn,
}) {
  if (
    items.length
  ) {
    const catalogRows =
      items.map(
        (item) => ({
          id:
            item.id,

          name:
            item.name,

          slug:
            item.slug ||
            null,

          updated_at:
            new Date().toISOString(),
        })
      );

    await supabaseRequest(
      environment,
      `${catalogTable}?on_conflict=id`,
      {
        method:
          "POST",

        prefer:
          "resolution=merge-duplicates,return=minimal",

        body:
          JSON.stringify(
            catalogRows
          ),
      }
    );
  }

  await deleteGameRelations(
    environment,
    relationTable,
    gameId
  );

  if (
    !items.length
  ) {
    return;
  }

  const relationRows =
    items.map(
      (item) => ({
        game_id:
          gameId,

        [relationColumn]:
          item.id,
      })
    );

  await supabaseRequest(
    environment,
    `${relationTable}?on_conflict=game_id,${relationColumn}`,
    {
      method:
        "POST",

      prefer:
        "resolution=merge-duplicates,return=minimal",

      body:
        JSON.stringify(
          relationRows
        ),
    }
  );
}

/* =========================================================
   CATÁLOGOS
========================================================= */

async function saveGenres(
  environment,
  game
) {
  await saveCatalogRelation({
    environment,
    gameId:
      game.id,
    items:
      game.genres,
    catalogTable:
      "genres",
    relationTable:
      "game_genres",
    relationColumn:
      "genre_id",
  });
}

async function saveThemes(
  environment,
  game
) {
  await saveCatalogRelation({
    environment,
    gameId:
      game.id,
    items:
      game.themes,
    catalogTable:
      "themes",
    relationTable:
      "game_themes",
    relationColumn:
      "theme_id",
  });
}

async function saveGameModes(
  environment,
  game
) {
  await saveCatalogRelation({
    environment,
    gameId:
      game.id,
    items:
      game.gameModes,
    catalogTable:
      "game_modes",
    relationTable:
      "game_game_modes",
    relationColumn:
      "game_mode_id",
  });
}

async function savePerspectives(
  environment,
  game
) {
  await saveCatalogRelation({
    environment,
    gameId:
      game.id,
    items:
      game.perspectives,
    catalogTable:
      "player_perspectives",
    relationTable:
      "game_player_perspectives",
    relationColumn:
      "perspective_id",
  });
}

async function saveEngines(
  environment,
  game
) {
  await saveCatalogRelation({
    environment,
    gameId:
      game.id,
    items:
      game.engines,
    catalogTable:
      "game_engines",
    relationTable:
      "game_game_engines",
    relationColumn:
      "engine_id",
  });
}

/* =========================================================
   WEBS
========================================================= */

async function saveWebsites(
  environment,
  game
) {
  await deleteGameRelations(
    environment,
    "game_websites",
    game.id
  );

  if (
    !game.websites.length
  ) {
    return;
  }

  const rows =
    game.websites.map(
      (website) => ({
        game_id:
          game.id,

        category:
          website.category,

        url:
          website.url,

        trusted:
          website.trusted,

        position:
          website.position,
      })
    );

  await supabaseRequest(
    environment,
    "game_websites",
    {
      method:
        "POST",

      body:
        JSON.stringify(
          rows
        ),
    }
  );
}

/* =========================================================
   SIMILARES
========================================================= */

async function saveSimilarGames(
  environment,
  game
) {
  await deleteGameRelations(
    environment,
    "game_similar_games",
    game.id
  );

  if (
    !game.similarGames.length
  ) {
    return;
  }

  const rows =
    game.similarGames.map(
      (item) => ({
        game_id:
          game.id,

        similar_game_id:
          item.id,

        position:
          item.position,
      })
    );

  await supabaseRequest(
    environment,
    "game_similar_games?on_conflict=game_id,similar_game_id",
    {
      method:
        "POST",

      prefer:
        "resolution=merge-duplicates,return=minimal",

      body:
        JSON.stringify(
          rows
        ),
    }
  );
}

/* =========================================================
   EDADES
========================================================= */

async function saveAgeRatings(
  environment,
  game
) {
  await deleteGameRelations(
    environment,
    "game_age_ratings",
    game.id
  );

  if (
    !game.ageRatings.length
  ) {
    return;
  }

  const rows =
    game.ageRatings.map(
      (item) => ({
        game_id:
          game.id,

        organization:
          item.organization,

        rating:
          item.rating,

        synopsis:
          item.synopsis,

        content_descriptors:
          item.contentDescriptors ||
          [],
      })
    );

  await supabaseRequest(
    environment,
    "game_age_ratings",
    {
      method:
        "POST",

      body:
        JSON.stringify(
          rows
        ),
    }
  );
}

/* =========================================================
   IDIOMAS
========================================================= */

async function saveLanguages(
  environment,
  game
) {
  await deleteGameRelations(
    environment,
    "game_languages",
    game.id
  );

  if (
    !game.languages.length
  ) {
    return;
  }

  const rows =
    game.languages.map(
      (language) => ({
        game_id:
          game.id,

        language_id:
          language.languageId,

        language_name:
          language.languageName,

        native_name:
          language.nativeName,

        audio:
          Boolean(
            language.audio
          ),

        subtitles:
          Boolean(
            language.subtitles
          ),

        interface:
          Boolean(
            language.interface
          ),
      })
    );

  await supabaseRequest(
    environment,
    "game_languages",
    {
      method:
        "POST",

      body:
        JSON.stringify(
          rows
        ),
    }
  );
}

/* =========================================================
   SINCRONIZAR UN JUEGO
========================================================= */

async function syncGame(
  environment,
  game
) {
  await saveGame(
    environment,
    game
  );

  await savePlatforms(
    environment,
    game
  );

  await saveVideos(
    environment,
    game
  );

  await saveScreenshots(
    environment,
    game
  );

  await saveArtworks(
    environment,
    game
  );

  await saveAlternativeNames(
    environment,
    game
  );

  await saveGenres(
    environment,
    game
  );

  await saveThemes(
    environment,
    game
  );

  await saveGameModes(
    environment,
    game
  );

  await savePerspectives(
    environment,
    game
  );

  await saveEngines(
    environment,
    game
  );

  await saveWebsites(
    environment,
    game
  );

  await saveSimilarGames(
    environment,
    game
  );

  await saveAgeRatings(
    environment,
    game
  );

  await saveLanguages(
    environment,
    game
  );
}

/* =========================================================
   RESUMEN
========================================================= */

function createGameResult(
  game,
  extra = {}
) {
  return {
    id:
      game.id,

    name:
      game.name,

    ...extra,

    type: {
      id:
        game.category,

      name:
        game.releaseType,
    },

    status: {
      id:
        game.status,

      name:
        game.gameStatusName,
    },

    parentGame:
      game.parentGameId
        ? {
            id:
              game.parentGameId,

            name:
              game.parentGameName,
          }
        : null,

    versionParent:
      game.versionParentId
        ? {
            id:
              game.versionParentId,

            name:
              game.versionParentName,

            title:
              game.versionTitle,
          }
        : null,

    genres:
      game.genres.map(
        (item) =>
          item.name
      ),

    themes:
      game.themes.map(
        (item) =>
          item.name
      ),

    artworks:
      game.artworks.length,

    screenshots:
      game.screenshots.length,

    videos:
      game.videos.length,

    similarGames:
      game.similarGames.map(
        (item) =>
          item.id
      ),

    ageRatings:
      game.ageRatings.map(
        (item) => ({
          organization:
            item.organization,

          rating:
            item.rating,

          descriptors:
            item.contentDescriptors,
        })
      ),

    languages:
      game.languages.map(
        (language) => ({
          id:
            language.languageId,

          name:
            language.languageName,

          nativeName:
            language.nativeName,

          locale:
            language.locale,

          audio:
            language.audio,

          subtitles:
            language.subtitles,

          interface:
            language.interface,
        })
      ),
  };
}

/* =========================================================
   SINCRONIZACIÓN GENERAL
========================================================= */

async function runGeneralSync() {
  const environment =
    getEnvironment();

  const accessToken =
    await getTwitchAccessToken(
      environment.igdbClientId,
      environment.igdbClientSecret
    );

  const rawGames =
    await getGamesFromIGDB(
      accessToken,
      environment.igdbClientId
    );

  const games =
    rawGames.map(
      normalizeGame
    );

  const syncedGames = [];

  for (
    const game of games
  ) {
    const existedBefore =
      await gameExists(
        environment,
        game.id
      );

    await syncGame(
      environment,
      game
    );

    syncedGames.push(
      createGameResult(
        game,
        {
          existedBefore,
        }
      )
    );
  }

  return {
    ok:
      true,

    mode:
      "general",

    message:
      "IGDB sincronizado correctamente con la ficha maestra de Freaky World.",

    synced:
      syncedGames.length,

    games:
      syncedGames,
  };
}

/* =========================================================
   IMPORTACIÓN INDIVIDUAL
========================================================= */

async function runSingleGameSync(
  gameId
) {
  const environment =
    getEnvironment();

  const accessToken =
    await getTwitchAccessToken(
      environment.igdbClientId,
      environment.igdbClientSecret
    );

  const rawGame =
    await getGameFromIGDBById(
      accessToken,
      environment.igdbClientId,
      gameId
    );

  if (!rawGame) {
    return {
      ok:
        false,

      mode:
        "single",

      found:
        false,

      gameId,

      message:
        `IGDB no encontró el juego con ID ${gameId}.`,
    };
  }

  const game =
    normalizeGame(
      rawGame
    );

  const existedBefore =
    await gameExists(
      environment,
      game.id
    );

  await syncGame(
    environment,
    game
  );

  return {
    ok:
      true,

    mode:
      "single",

    found:
      true,

    created:
      !existedBefore,

    updated:
      existedBefore,

    message:
      existedBefore
        ? `${game.name} ya existía y fue actualizado correctamente.`
        : `${game.name} fue incorporado correctamente a la biblioteca de Freaky World.`,

    game:
      createGameResult(
        game,
        {
          existedBefore,
        }
      ),
  };
}

/* =========================================================
   IMPORTACIÓN MASIVA
========================================================= */

async function runBulkSync({
  after,
  limit,
}) {
  const environment =
    getEnvironment();

  const accessToken =
    await getTwitchAccessToken(
      environment.igdbClientId,
      environment.igdbClientSecret
    );

  const rawGames =
    await getBulkGamesFromIGDB(
      accessToken,
      environment.igdbClientId,
      after,
      limit
    );

  const games =
    rawGames.map(
      normalizeGame
    );

  const results = [];

  let created = 0;
  let updated = 0;
  let failed = 0;

  /*
    Cada juego se procesa independientemente.

    Si uno falla, el lote continúa.
  */

  for (const game of games) {
    try {
      const existedBefore =
        await gameExists(
          environment,
          game.id
        );

      await syncGame(
        environment,
        game
      );

      if (existedBefore) {
        updated += 1;
      } else {
        created += 1;
      }

      results.push({
        id:
          game.id,

        name:
          game.name,

        ok:
          true,

        created:
          !existedBefore,

        updated:
          existedBefore,
      });
    } catch (error) {
      failed += 1;

      console.error(
        `ERROR IMPORTANDO IGDB ${game.id} ${game.name}:`,
        error
      );

      results.push({
        id:
          game.id,

        name:
          game.name,

        ok:
          false,

        error:
          error instanceof Error
            ? error.message
            : String(error),
      });
    }
  }

  /*
    IMPORTANTE:

    nextAfter avanza usando el último ID RECIBIDO
    desde IGDB, incluso si ese juego concreto falló
    al guardarse.

    Los fallos aparecen en results y pueden
    reimportarse después individualmente por ID.
  */

  const lastRawGame =
    rawGames.length
      ? rawGames[
          rawGames.length - 1
        ]
      : null;

  const nextAfter =
    lastRawGame?.id ??
    after;

  const finished =
    rawGames.length <
    limit;

  return {
    ok:
      true,

    mode:
      "bulk",

    message:
      finished
        ? "El lote se procesó y no quedan más juegos que cumplan los criterios actuales."
        : "Lote procesado correctamente. Usá nextAfter para continuar.",

    requestedAfter:
      after,

    requestedLimit:
      limit,

    received:
      rawGames.length,

    processed:
      results.length,

    created,
    updated,
    failed,

    nextAfter,

    finished,

    nextUrl:
      finished
        ? null
        : `/api/igdb/sync?mode=bulk&after=${nextAfter}&limit=${limit}`,

    games:
      results,
  };
}

/* =========================================================
   VALIDACIONES
========================================================= */

function parsePositiveInteger(
  value,
  {
    name,
    allowZero = false,
    defaultValue = null,
    max = null,
  }
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return defaultValue;
  }

  const normalized =
    String(value).trim();

  if (
    !/^\d+$/.test(
      normalized
    )
  ) {
    throw new Error(
      `El parámetro ${name} debe ser numérico.`
    );
  }

  const number =
    Number(normalized);

  const minimum =
    allowZero
      ? 0
      : 1;

  if (
    !Number.isSafeInteger(
      number
    ) ||
    number < minimum
  ) {
    throw new Error(
      `El parámetro ${name} no es válido.`
    );
  }

  if (
    max !== null &&
    number > max
  ) {
    throw new Error(
      `El parámetro ${name} no puede superar ${max}.`
    );
  }

  return number;
}

function parseGameId(value) {
  return parsePositiveInteger(
    value,
    {
      name:
        "id",

      allowZero:
        false,

      defaultValue:
        null,
    }
  );
}

function parseBulkAfter(value) {
  return parsePositiveInteger(
    value,
    {
      name:
        "after",

      allowZero:
        true,

      defaultValue:
        0,
    }
  );
}

function parseBulkLimit(value) {
  return parsePositiveInteger(
    value,
    {
      name:
        "limit",

      allowZero:
        false,

      defaultValue:
        DEFAULT_BATCH_SIZE,

      max:
        MAX_BATCH_SIZE,
    }
  );
}

/* =========================================================
   GET

   ORIGINAL:
   /api/igdb/sync

   INDIVIDUAL:
   /api/igdb/sync?id=40

   MASIVO:
   /api/igdb/sync?mode=bulk

   CONTINUAR:
   /api/igdb/sync?mode=bulk&after=12345

   CAMBIAR TAMAÑO:
   /api/igdb/sync?mode=bulk&after=12345&limit=25
========================================================= */

export async function GET(
  request
) {
  try {
    const { searchParams } =
      new URL(
        request.url
      );

    const mode =
      String(
        searchParams.get(
          "mode"
        ) || ""
      )
        .trim()
        .toLowerCase();

    const gameId =
      parseGameId(
        searchParams.get(
          "id"
        )
      );

    /*
      ID tiene prioridad.

      Así mantenemos exactamente:
      /api/igdb/sync?id=40
    */

    if (gameId) {
      const result =
        await runSingleGameSync(
          gameId
        );

      return NextResponse.json(
        result,
        {
          status:
            result.ok
              ? 200
              : 404,

          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate",
          },
        }
      );
    }

    /*
      MODO MASIVO
    */

    if (mode === "bulk") {
      const after =
        parseBulkAfter(
          searchParams.get(
            "after"
          )
        );

      const limit =
        parseBulkLimit(
          searchParams.get(
            "limit"
          )
        );

      const result =
        await runBulkSync({
          after,
          limit,
        });

      return NextResponse.json(
        result,
        {
          status: 200,

          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate",
          },
        }
      );
    }

    /*
      SIN PARÁMETROS:
      conservamos el sync original de 10.
    */

    const result =
      await runGeneralSync();

    return NextResponse.json(
      result,
      {
        status: 200,

        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error(
      "ERROR IGDB SYNC:",
      error
    );

    return NextResponse.json(
      {
        ok:
          false,

        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      {
        status:
          500,

        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  }
}
