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
   PETICIÓN A SUPABASE
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
   GET /api/games
========================================================= */

export async function GET() {
  try {
    const environment =
      getEnvironment();

    /*
      Por ahora devolvemos los juegos que ya tenemos
      sincronizados.

      Todavía NO llamamos a esto "Populares Hoy".

      El orden actual usa total_rating_count porque estos
      primeros 10 juegos vienen de nuestra prueba inicial
      de IGDB.

      Más adelante /api/games/popular-today tendrá nuestra
      lógica real de actualidad.
    */

    const games =
      await supabaseGet(
        environment,
        "games?select=id,slug,name,summary,first_release_date,release_year,rating,rating_count,total_rating,total_rating_count,hypes,cover_image_id,cover_small_url,cover_medium_url,cover_large_url,developer,publisher,source,active&active=eq.true&order=total_rating_count.desc&limit=10"
      );

    /*
      Cargamos relaciones de cada juego.

      Son solamente 10 en esta primera etapa, así que
      priorizamos claridad y funcionamiento antes de
      optimizarlo en una consulta más compleja.
    */

    const completeGames =
      await Promise.all(
        games.map(
          async (game) => {
            const [
              platformRelations,
              videos,
              screenshots,
            ] =
              await Promise.all([
                supabaseGet(
                  environment,
                  `game_platforms?select=platform_id&game_id=eq.${game.id}`
                ),

                supabaseGet(
                  environment,
                  `game_videos?select=id,name,youtube_id,youtube_url,position&game_id=eq.${game.id}&order=position.asc`
                ),

                supabaseGet(
                  environment,
                  `game_screenshots?select=id,image_id,image_url,position&game_id=eq.${game.id}&order=position.asc`
                ),
              ]);

            let platforms = [];

            if (
              platformRelations.length > 0
            ) {
              const platformIds =
                platformRelations
                  .map(
                    (item) =>
                      item.platform_id
                  )
                  .filter(Boolean);

              if (
                platformIds.length > 0
              ) {
                platforms =
                  await supabaseGet(
                    environment,
                    `platforms?select=id,name,abbreviation&id=in.(${platformIds.join(
                      ","
                    )})`
                  );
              }
            }

            return {
              id: game.id,

              slug: game.slug,

              name: game.name,

              summary: game.summary,

              releaseDate:
                game.first_release_date,

              year:
                game.release_year,

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

              developer:
                game.developer,

              publisher:
                game.publisher,

              platforms,

              videos: videos.map(
                (video) => ({
                  id: video.id,

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

              source:
                game.source,
            };
          }
        )
      );

    return NextResponse.json(
      {
        ok: true,

        source: "Freaky World Database",

        count:
          completeGames.length,

        games:
          completeGames,
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
      "[Freaky World / Games API]",
      error
    );

    return NextResponse.json(
      {
        ok: false,

        error:
          error instanceof Error
            ? error.message
            : "Error desconocido leyendo la base de datos.",
      },
      {
        status: 500,
      }
    );
  }
}
