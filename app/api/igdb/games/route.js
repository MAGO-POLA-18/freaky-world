import { NextResponse } from "next/server";

/* =========================================================
   CONFIG
========================================================= */

const TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const IGDB_GAMES_URL = "https://api.igdb.com/v4/games";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =========================================================
   OBTENER TOKEN DE TWITCH
========================================================= */

async function getTwitchAccessToken() {
  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Faltan IGDB_CLIENT_ID o IGDB_CLIENT_SECRET en las variables de entorno."
    );
  }

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
    const errorText = await response.text();

    throw new Error(
      `Twitch OAuth respondió ${response.status}: ${errorText}`
    );
  }

  const data = await response.json();

  if (!data.access_token) {
    throw new Error(
      "Twitch respondió correctamente, pero no devolvió access_token."
    );
  }

  return data.access_token;
}

/* =========================================================
   CONSULTAR IGDB
========================================================= */

async function getGamesFromIGDB(accessToken) {
  const clientId = process.env.IGDB_CLIENT_ID;

  /*
    Primera prueba:

    - juegos ya publicados
    - con portada
    - con puntuación
    - ordenados por popularidad
    - máximo 10

    Después cambiaremos esta consulta por nuestra lógica real
    de "Populares Hoy".
  */

  const now = Math.floor(Date.now() / 1000);

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

  const response = await fetch(IGDB_GAMES_URL, {
    method: "POST",

    headers: {
      "Client-ID": clientId,
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      "Content-Type": "text/plain",
    },

    body: query,

    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `IGDB respondió ${response.status}: ${errorText}`
    );
  }

  return response.json();
}

/* =========================================================
   LIMPIAR DATOS
========================================================= */

function normalizeGame(game) {
  const releaseDate = game.first_release_date
    ? new Date(game.first_release_date * 1000)
    : null;

  const developers =
    game.involved_companies
      ?.filter((item) => item.developer)
      ?.map((item) => item.company?.name)
      ?.filter(Boolean) || [];

  const publishers =
    game.involved_companies
      ?.filter((item) => item.publisher)
      ?.map((item) => item.company?.name)
      ?.filter(Boolean) || [];

  const platforms =
    game.platforms?.map((platform) => ({
      id: platform.id,
      name: platform.name,
      abbreviation: platform.abbreviation || null,
    })) || [];

  const videos =
    game.videos?.map((video) => ({
      name: video.name || null,
      youtubeId: video.video_id,
      youtubeUrl: video.video_id
        ? `https://www.youtube.com/watch?v=${video.video_id}`
        : null,
    })) || [];

  const screenshots =
    game.screenshots?.map((screenshot) => ({
      imageId: screenshot.image_id,

      url: screenshot.image_id
        ? `https://images.igdb.com/igdb/image/upload/t_screenshot_big/${screenshot.image_id}.jpg`
        : null,
    })) || [];

  return {
    id: game.id,

    name: game.name,

    slug: game.slug || null,

    summary: game.summary || null,

    releaseDate: releaseDate
      ? releaseDate.toISOString()
      : null,

    year: releaseDate
      ? releaseDate.getUTCFullYear()
      : null,

    rating:
      typeof game.rating === "number"
        ? Number(game.rating.toFixed(1))
        : null,

    ratingCount: game.rating_count || 0,

    totalRating:
      typeof game.total_rating === "number"
        ? Number(game.total_rating.toFixed(1))
        : null,

    totalRatingCount:
      game.total_rating_count || 0,

    hypes: game.hypes || 0,

    cover: game.cover?.image_id
      ? {
          imageId: game.cover.image_id,

          width: game.cover.width || null,

          height: game.cover.height || null,

          small:
            `https://images.igdb.com/igdb/image/upload/t_cover_small/${game.cover.image_id}.jpg`,

          medium:
            `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`,

          large:
            `https://images.igdb.com/igdb/image/upload/t_720p/${game.cover.image_id}.jpg`,
        }
      : null,

    platforms,

    developers,

    publishers,

    videos,

    screenshots,
  };
}

/* =========================================================
   GET /api/igdb/games
========================================================= */

export async function GET() {
  try {
    const accessToken =
      await getTwitchAccessToken();

    const games =
      await getGamesFromIGDB(accessToken);

    const normalizedGames =
      games.map(normalizeGame);

    return NextResponse.json(
      {
        ok: true,

        source: "IGDB",

        count: normalizedGames.length,

        games: normalizedGames,
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
      "[Freaky World / IGDB]",
      error
    );

    return NextResponse.json(
      {
        ok: false,

        error:
          error instanceof Error
            ? error.message
            : "Error desconocido conectando con IGDB.",
      },
      {
        status: 500,
      }
    );
  }
}
