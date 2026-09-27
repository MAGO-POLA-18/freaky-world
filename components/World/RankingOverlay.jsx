"use client";

import {
  useEffect,
  useMemo,
} from "react";

/* =========================================================
   FREAKY WORLD
   FICHA RÁPIDA DE JUEGO

   Esta ficha vive encima del mundo 3D.

   X
   VOLVER AL MUNDO
       -> cierran esta ficha

   VER FICHA COMPLETA
       -> queda preparado para abrir nuestra ficha 2D propia
========================================================= */

/* =========================================================
   YOUTUBE
========================================================= */

function getYoutubeId(
  game
) {
  const videos =
    Array.isArray(
      game?.videos
    )
      ? game.videos
      : [];

  if (
    videos.length === 0
  ) {
    return null;
  }

  /*
    Preferimos primero vídeos cuyo nombre parezca
    un trailer principal.

    Si no encontramos uno, usamos el primer vídeo
    disponible de IGDB.
  */

  const preferredWords = [
    "launch trailer",
    "official trailer",
    "release trailer",
    "gameplay trailer",
    "trailer",
  ];

  let selected = null;

  for (
    const word
    of preferredWords
  ) {
    selected =
      videos.find(
        (video) =>
          String(
            video?.name || ""
          )
            .toLowerCase()
            .includes(word)
      );

    if (selected) {
      break;
    }
  }

  if (!selected) {
    selected =
      videos[0];
  }

  return (
    selected?.youtubeId ||
    selected?.youtube_id ||
    null
  );
}

/* =========================================================
   PLATAFORMAS
========================================================= */

function getPlatforms(
  game
) {
  const platforms =
    Array.isArray(
      game?.platforms
    )
      ? game.platforms
      : [];

  if (
    platforms.length === 0
  ) {
    return "";
  }

  return platforms
    .map(
      (platform) =>
        platform?.abbreviation ||
        platform?.name
    )
    .filter(Boolean)
    .join(" · ");
}

/* =========================================================
   PUNTUACIÓN
========================================================= */

function getScore(
  game
) {
  const value =
    typeof game?.totalRating ===
    "number"
      ? game.totalRating
      : typeof game?.rating ===
          "number"
        ? game.rating
        : null;

  if (
    value === null
  ) {
    return null;
  }

  /*
    IGDB trabaja sobre 100.
    Freaky World muestra 0-10.
  */

  return (
    value / 10
  ).toFixed(1);
}

/* =========================================================
   PORTADA
========================================================= */

function getCover(
  game
) {
  return (
    game?.cover?.large ||
    game?.cover?.medium ||
    game?.cover?.small ||
    null
  );
}

/* =========================================================
   OVERLAY
========================================================= */

export default function RankingOverlay({
  game,
  onClose,
}) {
  /* =======================================================
     BLOQUEAR SCROLL DEL DOCUMENTO
  ======================================================= */

  useEffect(() => {
    const previous =
      document.body.style
        .overflow;

    document.body.style
      .overflow =
      "hidden";

    return () => {
      document.body.style
        .overflow =
        previous;
    };
  }, []);

  /* =======================================================
     CERRAR CON ESCAPE
  ======================================================= */

  useEffect(() => {
    function handleKeyDown(
      event
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        onClose?.();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [onClose]);

  const youtubeId =
    useMemo(
      () =>
        getYoutubeId(
          game
        ),
      [game]
    );

  const platforms =
    useMemo(
      () =>
        getPlatforms(
          game
        ),
      [game]
    );

  const score =
    useMemo(
      () =>
        getScore(
          game
        ),
      [game]
    );

  const cover =
    useMemo(
      () =>
        getCover(
          game
        ),
      [game]
    );

  if (
    !game?.id
  ) {
    return null;
  }

  const title =
    game.title ||
    game.name ||
    "Ficha del juego";

  const developer =
    game.developer ||
    game.subtitle ||
    game.publisher ||
    "";

  const year =
    game.year ||
    "";

  /* =======================================================
     FICHA COMPLETA

     Por ahora dejamos preparada la acción.

     En el siguiente paso construiremos la ficha 2D propia
     y este botón abrirá esa segunda capa.
  ======================================================= */

  function openFullGameCard() {
    window.dispatchEvent(
      new CustomEvent(
        "freaky:open-full-game",
        {
          detail: {
            game,
          },
        }
      )
    );
  }

  return (
    <div
      style={{
        position:
          "fixed",

        inset: 0,

        zIndex:
          99999,

        overflowY:
          "auto",

        background:
          "#080a0d",

        color:
          "#ffffff",

        fontFamily:
          "system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",

        WebkitOverflowScrolling:
          "touch",
      }}
    >
      {/* ===================================================
          CABECERA
      =================================================== */}

      <header
        style={{
          position:
            "sticky",

          top: 0,

          zIndex: 20,

          minHeight:
            82,

          padding:
            "14px 18px",

          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "space-between",

          gap: 16,

          background:
            "rgba(5,7,9,0.96)",

          borderBottom:
            `1px solid ${game.accent || "#5fdcff"}55`,

          backdropFilter:
            "blur(18px)",

          WebkitBackdropFilter:
            "blur(18px)",
        }}
      >
        <div
          style={{
            minWidth: 0,
          }}
        >
          <div
            style={{
              marginBottom:
                6,

              color:
                game.accent ||
                "#5fdcff",

              fontSize:
                12,

              lineHeight: 1,

              fontWeight:
                900,

              letterSpacing:
                ".18em",
            }}
          >
            FREAKY WORLD
          </div>

          <div
            style={{
              maxWidth:
                "calc(100vw - 100px)",

              overflow:
                "hidden",

              textOverflow:
                "ellipsis",

              whiteSpace:
                "nowrap",

              fontSize:
                "clamp(18px, 5vw, 27px)",

              fontWeight:
                850,
            }}
          >
            {title}
          </div>
        </div>

        <button
          type="button"
          aria-label="Cerrar ficha"
          onClick={
            onClose
          }
          style={{
            flex:
              "0 0 auto",

            width: 54,

            height: 54,

            display:
              "grid",

            placeItems:
              "center",

            borderRadius:
              "50%",

            border:
              "1px solid rgba(255,255,255,.22)",

            background:
              "#20252a",

            color:
              "#ffffff",

            fontSize:
              36,

            lineHeight: 1,

            cursor:
              "pointer",
          }}
        >
          ×
        </button>
      </header>

      {/* ===================================================
          CONTENIDO
      =================================================== */}

      <main
        style={{
          width:
            "min(100%, 1100px)",

          margin:
            "0 auto",

          padding:
            "clamp(18px,4vw,38px)",
        }}
      >
        {/* =================================================
            TRÁILER
        ================================================= */}

        <section
          style={{
            overflow:
              "hidden",

            position:
              "relative",

            width:
              "100%",

            aspectRatio:
              "16 / 9",

            border:
              "1px solid rgba(255,255,255,.12)",

            borderRadius:
              18,

            background:
              "#000000",

            boxShadow:
              "0 24px 70px rgba(0,0,0,.42)",
          }}
        >
          {youtubeId ? (
            <iframe
              src={
                `https://www.youtube.com/embed/${youtubeId}?playsinline=1&rel=0`
              }
              title={
                `Tráiler de ${title}`
              }
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{
                position:
                  "absolute",

                inset: 0,

                width:
                  "100%",

                height:
                  "100%",

                border: 0,
              }}
            />
          ) : cover ? (
            <img
              src={cover}
              alt={title}
              style={{
                width:
                  "100%",

                height:
                  "100%",

                objectFit:
                  "cover",

                display:
                  "block",

                opacity:
                  0.72,
              }}
            />
          ) : (
            <div
              style={{
                position:
                  "absolute",

                inset: 0,

                display:
                  "grid",

                placeItems:
                  "center",

                color:
                  "#8c969e",

                fontSize:
                  14,

                fontWeight:
                  700,
              }}
            >
              Tráiler no disponible
            </div>
          )}
        </section>

        {/* =================================================
            TÍTULO + PUNTUACIÓN
        ================================================= */}

        <section
          style={{
            display:
              "flex",

            alignItems:
              "flex-start",

            justifyContent:
              "space-between",

            gap: 20,

            marginTop:
              26,
          }}
        >
          <div
            style={{
              minWidth: 0,
            }}
          >
            <div
              style={{
                color:
                  game.accent ||
                  "#5fdcff",

                fontSize:
                  12,

                fontWeight:
                  900,

                letterSpacing:
                  ".14em",
              }}
            >
              {game.rank
                ? `TOP 10 · #${game.rank}`
                : "FREAKY WORLD"}
            </div>

            <h1
              style={{
                margin:
                  "7px 0 5px",

                fontSize:
                  "clamp(29px,7vw,55px)",

                lineHeight:
                  1.03,

                letterSpacing:
                  "-.035em",
              }}
            >
              {title}
            </h1>

            {developer && (
              <div
                style={{
                  color:
                    "#9da6ad",

                  fontSize:
                    "clamp(14px,3.8vw,18px)",
                }}
              >
                {developer}
              </div>
            )}
          </div>

          {score && (
            <div
              style={{
                flex:
                  "0 0 auto",

                minWidth:
                  72,

                padding:
                  "12px 13px",

                border:
                  `1px solid ${game.accent || "#5fdcff"}66`,

                borderRadius:
                  16,

                background:
                  `${game.accent || "#5fdcff"}18`,

                textAlign:
                  "center",
              }}
            >
              <div
                style={{
                  fontSize:
                    28,

                  lineHeight:
                    1,

                  fontWeight:
                    950,
                }}
              >
                {score}
              </div>

              <div
                style={{
                  marginTop:
                    4,

                  color:
                    "#89939a",

                  fontSize:
                    10,

                  fontWeight:
                    800,

                  letterSpacing:
                    ".08em",
                }}
              >
                / 10
              </div>
            </div>
          )}
        </section>

        {/* =================================================
            DATOS RÁPIDOS
        ================================================= */}

        <section
          style={{
            marginTop:
              22,

            padding:
              "17px 18px",

            border:
              "1px solid rgba(255,255,255,.09)",

            borderRadius:
              16,

            background:
              "#11151a",
          }}
        >
          <div
            style={{
              display:
                "flex",

              flexWrap:
                "wrap",

              gap:
                "10px 22px",

              color:
                "#c7cdd1",

              fontSize:
                14,

              lineHeight:
                1.5,
            }}
          >
            {year && (
              <span>
                <strong
                  style={{
                    color:
                      "#ffffff",
                  }}
                >
                  Año:
                </strong>{" "}
                {year}
              </span>
            )}

            {developer && (
              <span>
                <strong
                  style={{
                    color:
                      "#ffffff",
                  }}
                >
                  Desarrollo:
                </strong>{" "}
                {developer}
              </span>
            )}
          </div>

          {platforms && (
            <div
              style={{
                marginTop:
                  11,

                color:
                  "#939da4",

                fontSize:
                  13,

                lineHeight:
                  1.5,
              }}
            >
              {platforms}
            </div>
          )}
        </section>

        {/* =================================================
            BOTONES
        ================================================= */}

        <section
          style={{
            display:
              "grid",

            gridTemplateColumns:
              "repeat(auto-fit,minmax(210px,1fr))",

            gap: 12,

            marginTop:
              24,

            paddingBottom:
              "max(30px, env(safe-area-inset-bottom))",
          }}
        >
          <button
            type="button"
            onClick={
              onClose
            }
            style={{
              minHeight:
                54,

              padding:
                "14px 18px",

              border:
                "1px solid rgba(255,255,255,.18)",

              borderRadius:
                14,

              background:
                "#1b2025",

              color:
                "#ffffff",

              fontSize:
                14,

              fontWeight:
                900,

              letterSpacing:
                ".035em",

              cursor:
                "pointer",
            }}
          >
            VOLVER AL MUNDO
          </button>

          <button
            type="button"
            onClick={
              openFullGameCard
            }
            style={{
              minHeight:
                54,

              padding:
                "14px 18px",

              border:
                `1px solid ${game.accent || "#5fdcff"}`,

              borderRadius:
                14,

              background:
                game.accent ||
                "#5fdcff",

              color:
                "#050708",

              fontSize:
                14,

              fontWeight:
                950,

              letterSpacing:
                ".035em",

              cursor:
                "pointer",
            }}
          >
            VER FICHA COMPLETA
          </button>
        </section>
      </main>
    </div>
  );
}
