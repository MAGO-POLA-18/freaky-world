"use client";

import {
  useEffect,
  useState,
} from "react";

/* =========================================================
   CONFIG
========================================================= */

const FREAKY_RANKING_URL =
  "https://freakyranking.base44.app";

/* =========================================================
   YOUTUBE
========================================================= */

function getYouTubeId(
  url
) {
  if (!url) {
    return null;
  }

  try {
    const parsed =
      new URL(
        url
      );

    if (
      parsed.hostname.includes(
        "youtu.be"
      )
    ) {
      return (
        parsed.pathname
          .replace(
            "/",
            ""
          )
          .split(
            "/"
          )[0] ||
        null
      );
    }

    if (
      parsed.pathname
        .startsWith(
          "/shorts/"
        )
    ) {
      return (
        parsed.pathname
          .split(
            "/shorts/"
          )[1]
          ?.split(
            "/"
          )[0] ||
        null
      );
    }

    if (
      parsed.pathname
        .startsWith(
          "/embed/"
        )
    ) {
      return (
        parsed.pathname
          .split(
            "/embed/"
          )[1]
          ?.split(
            "/"
          )[0] ||
        null
      );
    }

    return parsed
      .searchParams
      .get(
        "v"
      );
  } catch {
    return null;
  }
}

/* =========================================================
   VIEWPORT
========================================================= */

function useViewport() {
  const [
    viewport,
    setViewport,
  ] =
    useState({
      width:
        390,

      height:
        844,
    });

  useEffect(() => {
    const update =
      () => {
        setViewport({
          width:
            window
              .innerWidth,

          height:
            window
              .innerHeight,
        });
      };

    update();

    window.addEventListener(
      "resize",
      update
    );

    window.addEventListener(
      "orientationchange",
      update
    );

    return () => {
      window.removeEventListener(
        "resize",
        update
      );

      window.removeEventListener(
        "orientationchange",
        update
      );
    };
  }, []);

  return viewport;
}

/* =========================================================
   VIDEO 2D
========================================================= */

function VideoOverlay({
  game,
  onClose,
}) {
  const viewport =
    useViewport();

  const youtubeId =
    getYouTubeId(
      game.videoUrl
    );

  const youtubeEmbedUrl =
    youtubeId
      ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&playsinline=1&controls=1&rel=0`
      : null;

  /*
    Espacio disponible descontando:
    - barra superior
    - márgenes
  */

  const availableWidth =
    Math.max(
      200,
      viewport.width -
        24
    );

  const availableHeight =
    Math.max(
      160,
      viewport.height -
        82
    );

  /*
    16:9 perfecto.

    Limitamos primero por ancho.
    Si excede la altura,
    recalculamos desde la altura.
  */

  let playerWidth =
    Math.min(
      1200,
      availableWidth
    );

  let playerHeight =
    playerWidth *
    9 /
    16;

  if (
    playerHeight >
    availableHeight
  ) {
    playerHeight =
      availableHeight;

    playerWidth =
      playerHeight *
      16 /
      9;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={
        game.title ||
        "Vídeo"
      }
      style={{
        position:
          "fixed",

        inset:
          0,

        zIndex:
          99999,

        display:
          "flex",

        flexDirection:
          "column",

        overflow:
          "hidden",

        background:
          "#05070a",

        color:
          "#fff",

        fontFamily:
          "system-ui,-apple-system,BlinkMacSystemFont,sans-serif",
      }}
    >
      {/* ===================================================
          CABECERA
      =================================================== */}

      <div
        style={{
          height:
            58,

          flex:
            "0 0 58px",

          padding:
            "8px 12px",

          boxSizing:
            "border-box",

          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "space-between",

          gap:
            12,

          background:
            "rgba(8,10,14,.98)",

          borderBottom:
            `2px solid ${
              game.accent ||
              "#58f1ff"
            }`,
        }}
      >
        <div
          style={{
            minWidth:
              0,
          }}
        >
          <div
            style={{
              color:
                game.accent ||
                "#58f1ff",

              fontSize:
                9,

              fontWeight:
                900,

              letterSpacing:
                ".14em",
            }}
          >
            FREAKY WORLD
          </div>

          <strong
            style={{
              display:
                "block",

              maxWidth:
                "70vw",

              overflow:
                "hidden",

              textOverflow:
                "ellipsis",

              whiteSpace:
                "nowrap",

              fontSize:
                14,
            }}
          >
            {game.title ||
              "VIDEO DESTACADO"}
          </strong>
        </div>

        <button
          type="button"
          onClick={
            onClose
          }
          style={{
            width:
              38,

            height:
              38,

            flex:
              "0 0 38px",

            border:
              "1px solid rgba(255,255,255,.18)",

            borderRadius:
              "50%",

            background:
              "#1d2329",

            color:
              "#fff",

            fontSize:
              23,

            lineHeight:
              1,
          }}
        >
          ×
        </button>
      </div>

      {/* ===================================================
          REPRODUCTOR
      =================================================== */}

      <div
        style={{
          flex:
            "1 1 auto",

          minHeight:
            0,

          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "center",

          overflow:
            "hidden",

          padding:
            12,

          boxSizing:
            "border-box",
        }}
      >
        <div
          style={{
            position:
              "relative",

            width:
              playerWidth,

            height:
              playerHeight,

            maxWidth:
              "100%",

            maxHeight:
              "100%",

            flex:
              "0 0 auto",

            overflow:
              "hidden",

            borderRadius:
              12,

            background:
              "#000",
          }}
        >
          {youtubeEmbedUrl ? (
            <iframe
              src={
                youtubeEmbedUrl
              }
              title={
                game.title ||
                "Video de YouTube"
              }
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              style={{
                position:
                  "absolute",

                inset:
                  0,

                display:
                  "block",

                width:
                  "100%",

                height:
                  "100%",

                border:
                  0,

                background:
                  "#000",
              }}
            />
          ) : (
            <video
              src={
                game.videoUrl
              }
              controls
              autoPlay
              playsInline
              style={{
                position:
                  "absolute",

                inset:
                  0,

                display:
                  "block",

                width:
                  "100%",

                height:
                  "100%",

                objectFit:
                  "contain",

                background:
                  "#000",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MOCK
========================================================= */

function MockGameCard({
  game,
  onClose,
}) {
  return (
    <div
      style={{
        position:
          "fixed",

        inset:
          0,

        zIndex:
          99999,

        overflowY:
          "auto",

        background:
          "#eceae4",

        color:
          "#171b1e",

        fontFamily:
          "system-ui,-apple-system,BlinkMacSystemFont,sans-serif",
      }}
    >
      <div
        style={{
          minHeight:
            58,

          padding:
            "10px 14px",

          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "space-between",

          background:
            "#11161a",

          color:
            "#fff",

          borderBottom:
            `3px solid ${game.accent}`,
        }}
      >
        <div>
          <div
            style={{
              color:
                game.accent,

              fontSize:
                10,

              fontWeight:
                900,

              letterSpacing:
                ".14em",
            }}
          >
            FREAKY WORLD
          </div>

          <strong>
            {game.title}
          </strong>
        </div>

        <button
          type="button"
          onClick={
            onClose
          }
          style={{
            width:
              42,

            height:
              42,

            borderRadius:
              "50%",

            border:
              "1px solid rgba(255,255,255,.2)",

            background:
              "#252b30",

            color:
              "#fff",

            fontSize:
              24,
          }}
        >
          ×
        </button>
      </div>

      <div
        style={{
          width:
            "min(900px, calc(100% - 32px))",

          margin:
            "20px auto",

          padding:
            22,

          borderRadius:
            20,

          background:
            "#fff",
        }}
      >
        <div
          style={{
            padding:
              26,

            borderRadius:
              18,

            color:
              "#fff",

            background:
              `linear-gradient(135deg, ${game.accent}, ${game.accent2}, #111820)`,
          }}
        >
          <div
            style={{
              fontSize:
                12,

              fontWeight:
                900,
            }}
          >
            POPULARES HOY · #{game.rank}
          </div>

          <h1
            style={{
              margin:
                "10px 0 8px",

              fontSize:
                "clamp(36px,8vw,72px)",
            }}
          >
            {game.title}
          </h1>

          <div>
            {game.subtitle}
          </div>
        </div>

        <p
          style={{
            lineHeight:
              1.6,

            color:
              "#50585d",
          }}
        >
          {game.description}
        </p>

        <button
          type="button"
          onClick={
            onClose
          }
          style={{
            padding:
              "12px 16px",

            border:
              0,

            borderRadius:
              12,

            background:
              game.accent,

            fontWeight:
              800,
          }}
        >
          Volver al mundo
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   OVERLAY
========================================================= */

export default function RankingOverlay({
  game,
  onClose,
}) {
  useEffect(() => {
    const previous =
      document.body
        .style
        .overflow;

    document.body
      .style
      .overflow =
      "hidden";

    return () => {
      document.body
        .style
        .overflow =
        previous;
    };
  }, []);

  if (
    !game?.id
  ) {
    return null;
  }

  if (
    game.overlayType ===
      "video" &&
    game.videoUrl
  ) {
    return (
      <VideoOverlay
        game={
          game
        }
        onClose={
          onClose
        }
      />
    );
  }

  if (
    game.mock
  ) {
    return (
      <MockGameCard
        game={
          game
        }
        onClose={
          onClose
        }
      />
    );
  }

  const gameUrl =
    `${FREAKY_RANKING_URL}/game/${game.id}`;

  return (
    <div
      className="ranking-overlay ranking-overlay-live"
    >
      <div className="ranking-overlay-live-bar">
        <div className="ranking-overlay-live-title">
          <span className="ranking-overlay-kicker">
            FREAKY WORLD
          </span>

          <strong>
            {game.title ||
              "Ficha del juego"}
          </strong>
        </div>

        <button
          type="button"
          className="ranking-overlay-close"
          onClick={
            onClose
          }
        >
          ×
        </button>
      </div>

      <div className="ranking-overlay-frame-wrap">
        <iframe
          className="ranking-overlay-frame"
          src={
            gameUrl
          }
          title={
            game.title ||
            "Freaky Ranking"
          }
          allow="fullscreen"
        />
      </div>
    </div>
  );
}
