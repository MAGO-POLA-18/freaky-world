import { NextResponse } from "next/server";

/* =========================================================
   CONFIG
========================================================= */

const TWITCH_TOKEN_URL =
  "https://id.twitch.tv/oauth2/token";

const IGDB_GAMES_URL =
  "https://api.igdb.com/v4/games";

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

  const response = await fetch(url, {
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

  const data = await response.json();

  if (!data.access_token) {
    throw new Error(
      "Twitch no devolvió access_token."
    );
  }

  return data.access_token;
}

/* =========================================================
   OBTENER JUEGOS DE IGDB
========================================================= */

async function getGamesFromIGDB(
  accessToken,
  clientId
) {
  const now =
    Math.floor(Date.now() / 1000);

  const query = `
    fields
      id,
      name,
      slug,
      summary,
      first_release_date,
      rating,
      rating_count,
      total_rating,
      total_rating_count,
      hypes,
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
      screenshots.image_id;

    where
      cover != null
      & first_release_date != null
      & first_release_date <= ${now}
      & total_rating_count > 20;

    sort total_rating_count desc;

    limit 10;
  `;

  const response =
    await fetch(IGDB_GAMES_URL, {
      method: "POST",

      headers: {
        "Client-ID": clientId,
        Authorization:
          `Bearer ${accessToken}`,
        Accept: "application/json",
        "Content-Type": "text/plain",
      },

      body: query,

      cache: "no-store",
    });

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `IGDB respondió ${response.status}: ${errorText}`
    );
  }

  return response.json();
}

/* =========================================================
   NORMALIZAR JUEGO
========================================================= */

function normalizeGame(game) {
  const releaseDate =
    game.first_release_date
      ? new Date(
          game.first_release_date * 1000
        )
      : null;

  const developers =
    game.involved_companies
      ?.filter(
        (item) =>
          item.developer &&
          item.company?.name
      )
      ?.map(
        (item) =>
          item.company.name
      ) || [];

  const publishers =
    game.involved_companies
      ?.filter(
        (item) =>
          item.publisher &&
          item.company?.name
      )
      ?.map(
        (item) =>
          item.company.name
      ) || [];

  const platforms =
    game.platforms?.map(
      (platform) => ({
        id: platform.id,
        name: platform.name,
        abbreviation:
          platform.abbreviation || null,
      })
    ) || [];

  const videos =
    game.videos
      ?.filter(
        (video) =>
          video.video_id
      )
      ?.map(
        (video, index) => ({
          name:
            video.name || null,

          youtubeId:
            video.video_id,

          youtubeUrl:
            `https://www.youtube.com/watch?v=${video.video_id}`,

          position: index,
        })
      ) || [];

  const screenshots =
    game.screenshots
      ?.filter(
        (screenshot) =>
          screenshot.image_id
      )
      ?.map(
        (screenshot, index) => ({
          imageId:
            screenshot.image_id,

          imageUrl:
            `https://images.igdb.com/igdb/image/upload/t_screenshot_big/${screenshot.image_id}.jpg`,

          position: index,
        })
      ) || [];

  return {
    id: game.id,

    slug:
      game.slug || null,

    name: game.name,

    summary:
      game.summary || null,

    firstReleaseDate:
      releaseDate
        ? releaseDate.toISOString()
        : null,

    releaseYear:
      releaseDate
        ? releaseDate.getUTCFullYear()
        : null,

    rating:
      typeof game.rating === "number"
        ? Number(
            game.rating.toFixed(2)
          )
        : null,

    ratingCount:
      game.rating_count || 0,

    totalRating:
      typeof game.total_rating ===
      "number"
        ? Number(
            game.total_rating.toFixed(2)
          )
        : null,

    totalRatingCount:
      game.total_rating_count || 0,

    hypes:
      game.hypes || 0,

    coverImageId:
      game.cover?.image_id || null,

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
      developers[0] || null,

    publisher:
      publishers[0] || null,

    platforms,

    videos,

    screenshots,
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
  const response = await fetch(
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

        ...(options.headers || {}),
      },

      cache: "no-store",
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
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/* =========================================================
   GUARDAR JUEGO
========================================================= */

async function saveGame(
  environment,
  game
) {
  const gameRow = {
    id: game.id,

    slug: game.slug,

    name: game.name,

    summary: game.summary,

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

    source: "IGDB",

    active: true,

    updated_at:
      new Date().toISOString(),
  };

  await supabaseRequest(
    environment,
    "games?on_conflict=id",
    {
      method: "POST",

      prefer:
        "resolution=merge-duplicates,return=minimal",

      body:
        JSON.stringify([gameRow]),
    }
  );

  return game;
}

/* =========================================================
   GUARDAR PLATAFORMAS
========================================================= */

async function savePlatforms(
  environment,
  game
) {
  if (!game.platforms.length) {
    return;
  }

  const platformRows =
    game.platforms.map(
      (platform) => ({
        id: platform.id,

        name: platform.name,

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
      method: "POST",

      prefer:
        "resolution=merge-duplicates,return=minimal",

      body:
        JSON.stringify(platformRows),
    }
  );

  /*
    Eliminamos las relaciones anteriores
    del juego para reconstruirlas.
  */

  await supabaseRequest(
    environment,
    `game_platforms?game_id=eq.${game.id}`,
    {
      method: "DELETE",
    }
  );

  const relationRows =
    game.platforms.map(
      (platform) => ({
        game_id: game.id,
        platform_id:
          platform.id,
      })
    );

  await supabaseRequest(
    environment,
    "game_platforms?on_conflict=game_id,platform_id",
    {
      method: "POST",

      prefer:
        "resolution=merge-duplicates,return=minimal",

      body:
        JSON.stringify(relationRows),
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
  await supabaseRequest(
    environment,
    `game_videos?game_id=eq.${game.id}`,
    {
      method: "DELETE",
    }
  );

  if (!game.videos.length) {
    return;
  }

  const rows =
    game.videos.map(
      (video) => ({
        game_id: game.id,

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
      method: "POST",

      prefer:
        "resolution=merge-duplicates,return=minimal",

      body:
        JSON.stringify(rows),
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
  await supabaseRequest(
    environment,
    `game_screenshots?game_id=eq.${game.id}`,
    {
      method: "DELETE",
    }
  );

  if (!game.screenshots.length) {
    return;
  }

  const rows =
    game.screenshots.map(
      (screenshot) => ({
        game_id: game.id,

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
      method: "POST",

      prefer:
        "resolution=merge-duplicates,return=minimal",

      body:
        JSON.stringify(rows),
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
}

/* =========================================================
   SINCRONIZACIÓN COMPLETA
========================================================= */

async function runSync() {
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

  for (const game of games) {
    await syncGame(
      environment,
      game
    );
  }

  return games;
}

/* =========================================================
   GET /api/igdb/sync
========================================================= */

export async function GET() {
  try {
    const games =
      await runSync();

    return NextResponse.json(
      {
        ok: true,

        message:
          "IGDB sincronizado correctamente con Supabase.",

        synced:
          games.length,

        games:
          games.map(
            (game) => ({
              id: game.id,
              name: game.name,
            })
          ),
      },
      {
        status: 200,

        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error(
      "[Freaky World / IGDB Sync]",
      error
    );

    return NextResponse.json(
      {
        ok: false,

        error:
          error instanceof Error
            ? error.message
            : "Error desconocido sincronizando IGDB con Supabase.",
      },
      {
        status: 500,
      }
    );
  }
}
