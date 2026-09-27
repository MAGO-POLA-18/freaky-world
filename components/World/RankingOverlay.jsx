"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

/* =========================================================
   FREAKY WORLD
   FICHA RÁPIDA RESPONSIVE

   VERTICAL:
   - vídeo arriba
   - información debajo

   HORIZONTAL / DESKTOP:
   - vídeo izquierda
   - información derecha
   - todo adaptado a la altura disponible
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
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",

        minHeight: 48,

        padding:
          "11px 16px",

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

        fontSize: 13,

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
  /*
    Horizontal incluye:

    - móvil apaisado
    - tablet apaisada
    - ordenador

    En vertical mantenemos el formato tradicional.
  */

  const horizontal =
    useMediaQuery(
      "(orientation: landscape)"
    );

  /*
    Detectamos pantallas bajas.

    Es especialmente importante en:
    - móviles horizontales
    - portátiles
  */

  const lowHeight =
    useMediaQuery(
      "(max-height: 700px)"
    );

  /* =======================================================
     BLOQUEAR SCROLL DEL DOCUMENTO
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

  /* =======================================================
     FICHA COMPLETA
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

  /* =======================================================
     TAMAÑOS RESPONSIVE
  ======================================================= */

  const headerHeight =
    horizontal
      ? lowHeight
        ? 58
        : 68
      : 82;

  const contentPadding =
    horizontal
      ? lowHeight
        ? 12
        : 18
      : "clamp(18px,4vw,38px)";

  return (
    <div
      style={{
        position: "fixed",

        inset: 0,

        zIndex: 99999,

        width: "100%",

        height: "100dvh",

        background:
          "#080a0d",

        color: "#ffffff",

        fontFamily:
          "system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",

        overflow:
          horizontal
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
            horizontal
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
                horizontal &&
                lowHeight
                  ? 3
                  : 5,

              color: accent,

              fontSize:
                horizontal &&
                lowHeight
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
                horizontal
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
              horizontal
                ? lowHeight
                  ? 40
                  : 46
                : 54,

            height:
              horizontal
                ? lowHeight
                  ? 40
                  : 46
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
              horizontal
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
            horizontal
              ? 1500
              : 1100,

          height:
            horizontal
              ? `calc(100dvh - ${headerHeight}px)`
              : "auto",

          margin: "0 auto",

          padding:
            contentPadding,

          overflow:
            horizontal
              ? "hidden"
              : "visible",
        }}
      >
        <div
          style={{
            width: "100%",

            height:
              horizontal
                ? "100%"
                : "auto",

            display: "grid",

            /*
              En horizontal reservamos más espacio
              al vídeo que a la ficha.

              En vertical queda una sola columna.
            */

            gridTemplateColumns:
              horizontal
                ? "minmax(0, 1.65fr) minmax(280px, .85fr)"
                : "1fr",

            gap:
              horizontal
                ? lowHeight
                  ? 14
                  : 22
                : 0,

            alignItems:
              horizontal
                ? "center"
                : "stretch",
          }}
        >
          {/* =================================================
              COLUMNA DEL VÍDEO
          ================================================= */}

          <section
            style={{
              width: "100%",

              minWidth: 0,

              display:
                horizontal
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
                  CLAVE DEL CAMBIO:

                  En horizontal el vídeo NO toma
                  simplemente el 100% del ancho.

                  Su tamaño queda limitado tanto
                  por el ancho como por la altura
                  real disponible.
                */

                width:
                  horizontal
                    ? "min(100%, calc((100dvh - 110px) * 16 / 9))"
                    : "100%",

                maxWidth:
                  "100%",

                aspectRatio:
                  "16 / 9",

                maxHeight:
                  horizontal
                    ? lowHeight
                      ? `calc(100dvh - ${headerHeight + 24}px)`
                      : `calc(100dvh - ${headerHeight + 40}px)`
                    : "none",

                overflow:
                  "hidden",

                border:
                  "1px solid rgba(255,255,255,.12)",

                borderRadius:
                  horizontal &&
                  lowHeight
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

                    width:
                      "100%",

                    height:
                      "100%",

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

                    width:
                      "100%",

                    height:
                      "100%",

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
              COLUMNA DE INFORMACIÓN
          ================================================= */}

          <section
            style={{
              minWidth: 0,

              height:
                horizontal
                  ? "100%"
                  : "auto",

              display: "flex",

              flexDirection:
                "column",

              justifyContent:
                horizontal
                  ? "center"
                  : "flex-start",

              overflowY:
                horizontal
                  ? "auto"
                  : "visible",

              paddingRight:
                horizontal
                  ? 3
                  : 0,

              scrollbarWidth:
                "thin",
            }}
          >
            {/* ===============================================
                TÍTULO / SCORE
            =============================================== */}

            <div
              style={{
                display: "flex",

                alignItems:
                  "flex-start",

                justifyContent:
                  "space-between",

                gap:
                  lowHeight
                    ? 12
                    : 18,

                marginTop:
                  horizontal
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
                      horizontal &&
                      lowHeight
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
                      horizontal &&
                      lowHeight
                        ? "5px 0 3px"
                        : "7px 0 5px",

                    fontSize:
                      horizontal
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
                        horizontal &&
                        lowHeight
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
                      horizontal &&
                      lowHeight
                        ? 56
                        : 66,

                    padding:
                      horizontal &&
                      lowHeight
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
                        horizontal &&
                        lowHeight
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

            {/* ===============================================
                DATOS
            =============================================== */}

            <div
              style={{
                marginTop:
                  horizontal &&
                  lowHeight
                    ? 10
                    : 18,

                padding:
                  horizontal &&
                  lowHeight
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
                    horizontal &&
                    lowHeight
                      ? "5px 13px"
                      : "8px 18px",

                  color:
                    "#c7cdd1",

                  fontSize:
                    horizontal &&
                    lowHeight
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
                      horizontal &&
                      lowHeight
                        ? 6
                        : 9,

                    color:
                      "#939da4",

                    fontSize:
                      horizontal &&
                      lowHeight
                        ? 10
                        : 12,

                    lineHeight: 1.4,
                  }}
                >
                  {platforms}
                </div>
              )}
            </div>

            {/* ===============================================
                BOTONES
            =============================================== */}

            <div
              style={{
                display: "grid",

                gridTemplateColumns:
                  horizontal &&
                  !lowHeight
                    ? "1fr 1fr"
                    : "1fr",

                gap:
                  horizontal &&
                  lowHeight
                    ? 7
                    : 10,

                marginTop:
                  horizontal &&
                  lowHeight
                    ? 10
                    : 18,

                paddingBottom:
                  horizontal
                    ? 0
                    : "max(30px, env(safe-area-inset-bottom))",
              }}
            >
              <ActionButton
                onClick={
                  onClose
                }
                accent={
                  accent
                }
              >
                VOLVER AL MUNDO
              </ActionButton>

              <ActionButton
                onClick={
                  openFullGameCard
                }
                primary
                accent={
                  accent
                }
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
