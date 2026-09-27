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
   SIMILARES

   game_similar_games guarda los IDs de IGDB.

   Acá resolvemos esos IDs contra nuestra biblioteca.

   Si el juego YA existe:
   devolvemos sus datos mínimos.

   Si todavía NO existe:
   conservamos el ID y marcamos available=false.

   IMPORTANTE:
   esta API NO importa automáticamente juegos.
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

  if (
    ids.length === 0
  ) {
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

  /* =======================================================
     TEXTOS

     Para interfaz usamos español si existe.

     También devolvemos explícitamente originales y español
     para no perder ninguna versión.
  ======================================================= */

  const displaySummary =
    game.summary_es ||
    game.summary ||
    null;

  const displayStoryline =
    game.storyline_es ||
    game.storyline ||
    null;

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

       available=true:
       ya está en nuestra biblioteca.

       available=false:
       IGDB lo relaciona pero todavía no lo importamos.
    ===================================================== */

    similarGames,

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
   CAMPOS BASE DE GAMES

   Centralizados para poder usarlos tanto en:
   /api/games
   como en:
   /api/games?id=40
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
   VALIDAR ID
========================================================= */

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

  if (
    !/^\d+$/.test(
      normalized
    )
  ) {
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

/* =========================================================
   GET /api/games

   Biblioteca:
   /api/games

   Ficha individual:
   /api/games?id=40
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

    const requestedId =
      parseGameId(
        searchParams.get(
          "id"
        )
      );

    /* =====================================================
       ID INVÁLIDO
    ===================================================== */

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
       FICHA INDIVIDUAL
    ===================================================== */

    if (
      requestedId !== null
    ) {
      const games =
        await supabaseGet(
          environment,
          [
            "games",
            "?select=",
            GAME_SELECT_FIELDS,
            `&id=eq.${requestedId}`,
            "&limit=1",
          ].join("")
        );

      if (
        !games ||
        games.length === 0
      ) {
        return NextResponse.json(
          {
            ok:
              false,

            found:
              false,

            id:
              requestedId,

            error:
              `El juego ${requestedId} no existe todavía en la biblioteca de Freaky World.`,
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

      const completeGame =
        await loadCompleteGame(
          environment,
          games[0]
        );

      return NextResponse.json(
        {
          ok:
            true,

          found:
            true,

          source:
            "Freaky World Database",

          game:
            completeGame,
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
       BIBLIOTECA

       Ya NO limitamos a los 10 juegos iniciales.

       Todo juego activo incorporado a Freaky World
       puede aparecer en esta API.
    ===================================================== */

    const games =
      await supabaseGet(
        environment,
        [
          "games",
          "?select=",
          GAME_SELECT_FIELDS,
          "&active=eq.true",
          "&order=total_rating_count.desc.nullslast",
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

        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      }
    );
  }
}
