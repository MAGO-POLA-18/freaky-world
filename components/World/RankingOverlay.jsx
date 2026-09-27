"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

/* =========================================================
   FREAKY WORLD
   FICHA RÁPIDA RESPONSIVE

   3 MODOS:

   1. VERTICAL
      vídeo arriba + información debajo

   2. MÓVIL / TABLET HORIZONTAL
      vídeo izquierda + información derecha

   3. DESKTOP
      vídeo contenido y centrado
      información derecha
      nunca supera la altura útil
========================================================= */

/* =========================================================
   YOUTUBE
========================================================= */

function getYoutubeId(game) {
  const videos =
    Array.isArray(game?.videos)
      ? game.videos
      : [];

  if (!videos.length) {
    return null;
  }

  const preferredWords = [
    "launch trailer",
    "official trailer",
    "release trailer",
    "gameplay trailer",
    "trailer",
  ];

  let selected = null;

  for (const word of preferredWords) {
    selected = videos.find(
      (video) =>
        String(video?.name || "")
          .toLowerCase()
          .includes(word)
    );

    if (selected) {
      break;
    }
  }

  if (!selected) {
    selected = videos[0];
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

function getPlatforms(game) {
  const platforms =
    Array.isArray(game?.platforms)
      ? game.platforms
      : [];

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

function getScore(game) {
  const value =
    typeof game?.totalRating === "number"
      ? game.totalRating
      : typeof game?.rating === "number"
        ? game.rating
        : null;

  if (value === null) {
    return null;
  }

  return (value / 10).toFixed(1);
}

/* =========================================================
   PORTADA
========================================================= */

function getCover(game) {
  return (
    game?.cover?.large ||
    game?.cover?.medium ||
    game?.cover?.small ||
    null
  );
}

/* =========================================================
   MEDIA QUERY
========================================================= */

function useMediaQuery(query) {
  const [matches, setMatches] =
    useState(false);

  useEffect(() => {
    const media =
      window.matchMedia(query);

    const update = () => {
      setMatches(media.matches);
    };

    update();

    media.addEventListener?.(
      "change",
      update
    );

    return () => {
      media.removeEventListener?.(
        "change",
        update
      );
    };
  }, [query]);

  return matches;
}

/* =========================================================
   BOTÓN
========================================================= */

function ActionButton({
  children,
  onClick,
  primary = false,
  accent = "#5fdcff",
  compact = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",

        minHeight:
          compact
            ? 42
            : 48,

        padding:
          compact
            ? "9px 12px"
            : "11px 16px",

        border:
          primary
            ? `1px solid ${accent}`
            : "1px solid rgba(255,255,255,.18)",

        borderRadius: 13,

        background:
          primary
            ? accent
            : "#1b2025",

        color:
          primary
            ? "#050708"
            : "#ffffff",

        fontSize:
          compact
            ? 11
            : 13,

        fontWeight: 900,

        letterSpacing:
          ".035em",

        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

/* =========================================================
   OVERLAY
========================================================= */

export default function RankingOverlay({
  game,
  onClose,
}) {
  const horizontal =
    useMediaQuery(
      "(orientation: landscape)"
    );

  /*
    Desktop real.

    Lo separamos de orientación porque un ordenador
    normalmente también es landscape, pero necesita
    un tratamiento distinto al móvil horizontal.
  */

  const desktop =
    useMediaQuery(
      "(min-width: 1100px)"
    );

  const lowHeight =
    useMediaQuery(
      "(max-height: 700px)"
    );

  /* =======================================================
     BLOQUEAR SCROLL EXTERIOR
  ======================================================= */

  useEffect(() => {
    const previous =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previous;
    };
  }, []);

  /* =======================================================
     ESCAPE
  ======================================================= */

  useEffect(() => {
    function handleKeyDown(event) {
      if (
        event.key === "Escape"
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
      () => getYoutubeId(game),
      [game]
    );

  const platforms =
    useMemo(
      () => getPlatforms(game),
      [game]
    );

  const score =
    useMemo(
      () => getScore(game),
      [game]
    );

  const cover =
    useMemo(
      () => getCover(game),
      [game]
    );

  if (!game?.id) {
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
    game.year || "";

  const accent =
    game.accent ||
    "#5fdcff";

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

  /* =======================================================
     TAMAÑOS
  ======================================================= */

  const headerHeight =
    desktop
      ? 64
      : horizontal
        ? lowHeight
          ? 58
          : 68
        : 82;

  const horizontalLayout =
    horizontal || desktop;

  const compact =
    lowHeight || desktop;

  return (
    <div
      style={{
        position: "fixed",

        inset: 0,

        zIndex: 99999,

        width: "100%",

        height: "100dvh",

        boxSizing: "border-box",

        background:
          "#080a0d",

        color: "#ffffff",

        fontFamily:
          "system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",

        overflow:
          horizontalLayout
            ? "hidden"
            : "auto",

        WebkitOverflowScrolling:
          "touch",
      }}
    >
      {/* ===================================================
          CABECERA
      =================================================== */}

      <header
        style={{
          height:
            headerHeight,

          boxSizing:
            "border-box",

          padding:
            desktop
              ? "9px 22px"
              : horizontal
                ? lowHeight
                  ? "8px 14px"
                  : "10px 18px"
                : "14px 18px",

          display: "flex",

          alignItems: "center",

          justifyContent:
            "space-between",

          gap: 14,

          background:
            "rgba(5,7,9,.97)",

          borderBottom:
            `1px solid ${accent}55`,

          backdropFilter:
            "blur(18px)",

          WebkitBackdropFilter:
            "blur(18px)",
        }}
      >
        <div
          style={{
            minWidth: 0,
            flex: 1,
          }}
        >
          <div
            style={{
              marginBottom:
                compact
                  ? 3
                  : 5,

              color: accent,

              fontSize:
                compact
                  ? 9
                  : 11,

              lineHeight: 1,

              fontWeight: 900,

              letterSpacing:
                ".18em",
            }}
          >
            FREAKY WORLD
          </div>

          <div
            style={{
              overflow:
                "hidden",

              textOverflow:
                "ellipsis",

              whiteSpace:
                "nowrap",

              fontSize:
                desktop
                  ? 20
                  : horizontal
                    ? lowHeight
                      ? 17
                      : 21
                    : "clamp(18px,5vw,27px)",

              fontWeight: 850,
            }}
          >
            {title}
          </div>
        </div>

        <button
          type="button"
          aria-label="Cerrar ficha"
          onClick={onClose}
          style={{
            flex: "0 0 auto",

            width:
              compact
                ? 42
                : 54,

            height:
              compact
                ? 42
                : 54,

            display: "grid",

            placeItems:
              "center",

            borderRadius:
              "50%",

            border:
              "1px solid rgba(255,255,255,.22)",

            background:
              "#20252a",

            color: "#ffffff",

            fontSize:
              compact
                ? 29
                : 36,

            lineHeight: 1,

            cursor: "pointer",
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
          boxSizing:
            "border-box",

          width: "100%",

          maxWidth:
            desktop
              ? 1380
              : horizontal
                ? 1500
                : 1100,

          height:
            horizontalLayout
              ? `calc(100dvh - ${headerHeight}px)`
              : "auto",

          margin: "0 auto",

          padding:
            desktop
              ? "18px 24px"
              : horizontal
                ? lowHeight
                  ? 12
                  : 18
                : "clamp(18px,4vw,38px)",

          overflow:
            horizontalLayout
              ? "hidden"
              : "visible",
        }}
      >
        <div
          style={{
            width: "100%",

            height:
              horizontalLayout
                ? "100%"
                : "auto",

            display: "grid",

            /*
              PC:
              vídeo contenido + ficha lateral.

              Móvil horizontal:
              conservamos la proporción que ya funciona.
            */

            gridTemplateColumns:
              desktop
                ? "minmax(0, 1.45fr) minmax(320px, .75fr)"
                : horizontal
                  ? "minmax(0, 1.65fr) minmax(280px, .85fr)"
                  : "1fr",

            gap:
              desktop
                ? 28
                : horizontal
                  ? lowHeight
                    ? 14
                    : 22
                  : 0,

            alignItems:
              horizontalLayout
                ? "center"
                : "stretch",
          }}
        >
          {/* =================================================
              VÍDEO
          ================================================= */}

          <section
            style={{
              width: "100%",

              height:
                horizontalLayout
                  ? "100%"
                  : "auto",

              minWidth: 0,

              display:
                horizontalLayout
                  ? "flex"
                  : "block",

              alignItems:
                "center",

              justifyContent:
                "center",
            }}
          >
            <div
              style={{
                position:
                  "relative",

                /*
                  DESKTOP:

                  El tamaño se calcula primero por ALTURA.

                  max-height impide que el reproductor
                  pueda salir del viewport.

                  aspect-ratio mantiene 16:9.

                  width:auto permite que Three/Browser
                  calcule el ancho correspondiente.
                */

                width:
                  desktop
                    ? "min(100%, calc((100dvh - 120px) * 16 / 9))"
                    : horizontal
                      ? "min(100%, calc((100dvh - 110px) * 16 / 9))"
                      : "100%",

                maxWidth:
                  desktop
                    ? "900px"
                    : "100%",

                aspectRatio:
                  "16 / 9",

                maxHeight:
                  desktop
                    ? `calc(100dvh - ${headerHeight + 60}px)`
                    : horizontal
                      ? lowHeight
                        ? `calc(100dvh - ${headerHeight + 24}px)`
                        : `calc(100dvh - ${headerHeight + 40}px)`
                      : "none",

                overflow:
                  "hidden",

                border:
                  "1px solid rgba(255,255,255,.12)",

                borderRadius:
                  compact
                    ? 12
                    : 18,

                background:
                  "#000000",

                boxShadow:
                  "0 20px 60px rgba(0,0,0,.4)",
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

                    width: "100%",

                    height: "100%",

                    display:
                      "block",

                    border: 0,
                  }}
                />
              ) : cover ? (
                <img
                  src={cover}
                  alt={title}
                  style={{
                    position:
                      "absolute",

                    inset: 0,

                    width: "100%",

                    height: "100%",

                    objectFit:
                      "contain",

                    display:
                      "block",

                    background:
                      "#000000",
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

                    fontSize: 14,

                    fontWeight: 700,
                  }}
                >
                  Tráiler no disponible
                </div>
              )}
            </div>
          </section>

          {/* =================================================
              INFORMACIÓN
          ================================================= */}

          <section
            style={{
              minWidth: 0,

              height:
                horizontalLayout
                  ? "100%"
                  : "auto",

              display: "flex",

              flexDirection:
                "column",

              justifyContent:
                horizontalLayout
                  ? "center"
                  : "flex-start",

              overflowY:
                horizontalLayout
                  ? "auto"
                  : "visible",

              paddingRight:
                horizontalLayout
                  ? 4
                  : 0,

              scrollbarWidth:
                "thin",
            }}
          >
            {/* TÍTULO */}

            <div
              style={{
                display: "flex",

                alignItems:
                  "flex-start",

                justifyContent:
                  "space-between",

                gap:
                  compact
                    ? 12
                    : 18,

                marginTop:
                  horizontalLayout
                    ? 0
                    : 26,
              }}
            >
              <div
                style={{
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    color: accent,

                    fontSize:
                      compact
                        ? 9
                        : 11,

                    fontWeight: 900,

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
                      compact
                        ? "5px 0 3px"
                        : "7px 0 5px",

                    fontSize:
                      desktop
                        ? "clamp(24px,2.4vw,38px)"
                        : horizontal
                          ? lowHeight
                            ? "clamp(19px,3.3vw,30px)"
                            : "clamp(24px,3vw,42px)"
                          : "clamp(29px,7vw,55px)",

                    lineHeight: 1.03,

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
                        compact
                          ? 12
                          : 14,
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
                      compact
                        ? 56
                        : 66,

                    padding:
                      compact
                        ? "8px 9px"
                        : "10px 11px",

                    border:
                      `1px solid ${accent}66`,

                    borderRadius:
                      14,

                    background:
                      `${accent}18`,

                    textAlign:
                      "center",
                  }}
                >
                  <div
                    style={{
                      fontSize:
                        compact
                          ? 21
                          : 26,

                      lineHeight: 1,

                      fontWeight: 950,
                    }}
                  >
                    {score}
                  </div>

                  <div
                    style={{
                      marginTop: 3,

                      color:
                        "#89939a",

                      fontSize: 9,

                      fontWeight: 800,
                    }}
                  >
                    / 10
                  </div>
                </div>
              )}
            </div>

            {/* DATOS */}

            <div
              style={{
                marginTop:
                  compact
                    ? 10
                    : 18,

                padding:
                  compact
                    ? "10px 12px"
                    : "14px 15px",

                border:
                  "1px solid rgba(255,255,255,.09)",

                borderRadius:
                  14,

                background:
                  "#11151a",
              }}
            >
              <div
                style={{
                  display: "flex",

                  flexWrap: "wrap",

                  gap:
                    compact
                      ? "5px 13px"
                      : "8px 18px",

                  color:
                    "#c7cdd1",

                  fontSize:
                    compact
                      ? 11
                      : 13,

                  lineHeight: 1.45,
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
                      compact
                        ? 6
                        : 9,

                    color:
                      "#939da4",

                    fontSize:
                      compact
                        ? 10
                        : 12,

                    lineHeight: 1.4,
                  }}
                >
                  {platforms}
                </div>
              )}
            </div>

            {/* BOTONES */}

            <div
              style={{
                display: "grid",

                gridTemplateColumns:
                  desktop
                    ? "1fr"
                    : horizontal &&
                        !lowHeight
                      ? "1fr 1fr"
                      : "1fr",

                gap:
                  compact
                    ? 7
                    : 10,

                marginTop:
                  compact
                    ? 10
                    : 18,

                paddingBottom:
                  horizontalLayout
                    ? 0
                    : "max(30px, env(safe-area-inset-bottom))",
              }}
            >
              <ActionButton
                onClick={onClose}
                accent={accent}
                compact={compact}
              >
                VOLVER AL MUNDO
              </ActionButton>

              <ActionButton
                onClick={
                  openFullGameCard
                }
                primary
                accent={accent}
                compact={compact}
              >
                VER FICHA COMPLETA
              </ActionButton>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
