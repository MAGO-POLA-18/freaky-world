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
      `Supabase respondió ${response.status}: ${errorText}`
    );
  }

  return response.json();
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

  if (
    ids.length === 0
  ) {
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

  if (
    ids.length === 0
  ) {
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
   CARGAR FICHA MAESTRA
========================================================= */

async function loadCompleteGame(
  environment,
  game
) {
  const [
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
    websites,
    similarGames,
    ageRatings,
    languages,
  ] =
    await Promise.all([
      loadPlatforms(
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
        gameId: game.id,
        relationTable:
          "game_genres",
        relationColumn:
          "genre_id",
        catalogTable:
          "genres",
      }),

      loadCatalogRelation({
        environment,
        gameId: game.id,
        relationTable:
          "game_themes",
        relationColumn:
          "theme_id",
        catalogTable:
          "themes",
      }),

      loadCatalogRelation({
        environment,
        gameId: game.id,
        relationTable:
          "game_game_modes",
        relationColumn:
          "game_mode_id",
        catalogTable:
          "game_modes",
      }),

      loadCatalogRelation({
        environment,
        gameId: game.id,
        relationTable:
          "game_player_perspectives",
        relationColumn:
          "perspective_id",
        catalogTable:
          "player_perspectives",
      }),

      loadCatalogRelation({
        environment,
        gameId: game.id,
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

      supabaseGet(
        environment,
        `game_similar_games?select=similar_game_id,position&game_id=eq.${game.id}&order=position.asc`
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

  return {
    /* =====================================================
       IDENTIDAD
    ===================================================== */

    id:
      game.id,

    slug:
      game.slug,

    name:
      game.name,

    /* =====================================================
       TEXTOS
    ===================================================== */

    summary:
      game.summary,

    storyline:
      game.storyline,

    editorialSummary:
      game.editorial_summary,

    /* =====================================================
       LANZAMIENTO
    ===================================================== */

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

    /* =====================================================
       EMPRESAS / SAGA
    ===================================================== */

    developer:
      game.developer,

    publisher:
      game.publisher,

    franchise:
      game.franchise_name,

    collection:
      game.collection_name,

    /* =====================================================
       PUNTUACIONES IGDB
    ===================================================== */

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

    /* =====================================================
       PUNTUACIONES FREAKY
    ===================================================== */

    freakyOfficialScore:
      game.freaky_official_score,

    freakyOfficialVotes:
      game.freaky_official_votes,

    communityScore:
      game.community_score,

    communityVotes:
      game.community_votes,

    /* =====================================================
       PORTADA
    ===================================================== */

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

    /* =====================================================
       CLASIFICACIÓN
    ===================================================== */

    platforms,

    genres,

    themes,

    gameModes,

    playerPerspectives:
      perspectives,

    gameEngines:
      engines,

    /* =====================================================
       VÍDEOS
    ===================================================== */

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

    /* =====================================================
       GALERÍA
    ===================================================== */

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

    /* =====================================================
       TÍTULOS ALTERNATIVOS
    ===================================================== */

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

    /* =====================================================
       EDADES
    ===================================================== */

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

    /* =====================================================
       IDIOMAS
       Actualmente puede venir vacío.
       Lo completaremos en el siguiente paso específico.
    ===================================================== */

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

    /* =====================================================
       WEBS
    ===================================================== */

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

    /* =====================================================
       SIMILARES
    ===================================================== */

    similarGames:
      similarGames.map(
        (item) => ({
          id:
            item.similar_game_id,

          position:
            item.position,
        })
      ),

    /* =====================================================
       METADATOS
    ===================================================== */

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
   GET /api/games
========================================================= */

export async function GET() {
  try {
    const environment =
      getEnvironment();

    /*
      Seguimos usando los mismos 10 juegos de prueba.

      IMPORTANTE:
      esto todavía NO representa "Populares Hoy".

      No cambiamos ese comportamiento hasta crear
      la lógica real de actualidad.
    */

    const games =
      await supabaseGet(
        environment,
        [
          "games",
          "?select=",
          [
            "id",
            "slug",
            "name",
            "summary",
            "storyline",
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
          ].join(","),
          "&active=eq.true",
          "&order=total_rating_count.desc",
          "&limit=10",
        ].join("")
      );

    const completeGames =
      await Promise.all(
        games.map(
          (game) =>
            loadCompleteGame(
              environment,
              game
            )
        )
      );

    return NextResponse.json(
      {
        ok:
          true,

        source:
          "Freaky World Database",

        count:
          completeGames.length,

        games:
          completeGames,
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
  } catch (error) {
    console.error(
      "[Freaky World / Games API]",
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
      }
    );
  }
}
