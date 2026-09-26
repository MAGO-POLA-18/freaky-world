"use client";

import {
  useEffect,
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
      new URL(url);

    if (
      parsed.hostname.includes(
        "youtu.be"
      )
    ) {
      return parsed.pathname
        .replace("/", "")
        .split("/")[0];
    }

    if (
      parsed.pathname.startsWith(
        "/shorts/"
      )
    ) {
      return parsed.pathname
        .split("/shorts/")[1]
        ?.split("/")[0];
    }

    if (
      parsed.pathname.startsWith(
        "/embed/"
      )
    ) {
      return parsed.pathname
        .split("/embed/")[1]
        ?.split("/")[0];
    }

    return parsed.searchParams.get(
      "v"
    );
  } catch {
    return null;
  }
}

/* =========================================================
   VIDEO 2D
========================================================= */

function VideoOverlay({
  game,
  onClose,
}) {
  const youtubeId =
    getYouTubeId(
      game.videoUrl
    );

  const isYouTube =
    game.sourceType ===
      "youtube" ||
    Boolean(
      youtubeId
    );

  const youtubeEmbedUrl =
    youtubeId
      ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&playsinline=1&controls=1&rel=0&modestbranding=1`
      : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={
        game.title ||
        "VÃ­deo"
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

        background:
          "#05070a",

        color:
          "#fff",

        fontFamily:
          "system-ui,-apple-system,BlinkMacSystemFont,sans-serif",
      }}
    >
      {/* ===================================================
          BARRA
      =================================================== */}

      <div
        style={{
          minHeight:
            "58px",

          padding:
            "10px 14px",

          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "space-between",

          gap:
            "14px",

          background:
            "rgba(8,10,14,.96)",

          borderBottom:
            `2px solid ${
              game.accent ||
              "#58f1ff"
            }`,
        }}
      >
        <div>
          <div
            style={{
              color:
                game.accent ||
                "#58f1ff",

              fontSize:
                "10px",

              fontWeight:
                900,

              letterSpacing:
                ".14em",
            }}
          >
            FREAKY WORLD
          </div>

          <strong>
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
              "42px",

            height:
              "42px",

            border:
              "1px solid rgba(255,255,255,.18)",

            borderRadius:
              "50%",

            background:
              "#1d2329",

            color:
              "#fff",

            fontSize:
              "25px",
          }}
        >
          Ã
        </button>
      </div>

      {/* ===================================================
          CONTENIDO
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

          padding:
            "14px",
        }}
      >
        <div
          style={{
            width:
              "min(1200px, 100%)",
          }}
        >
          {isYouTube &&
          youtubeEmbedUrl ? (
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
                display:
                  "block",

                width:
                  "100%",

                maxHeight:
                  "calc(100vh - 100px)",

                aspectRatio:
                  "16 / 9",

                border:
                  0,

                background:
                  "#000",

                borderRadius:
                  "16px",
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
                display:
                  "block",

                width:
                  "100%",

                maxHeight:
                  "calc(100vh - 100px)",

                aspectRatio:
                  "16 / 9",

                objectFit:
                  "contain",

                background:
                  "#000",

                borderRadius:
                  "16px",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   FICHA MOCK
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
            "58px",

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
                "10px",

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
              "42px",

            height:
              "42px",

            borderRadius:
              "50%",

            border:
              "1px solid rgba(255,255,255,.2)",

            background:
              "#252b30",

            color:
              "#fff",

            fontSize:
              "24px",
          }}
        >
          Ã
        </button>
      </div>

      <div
        style={{
          width:
            "min(900px, calc(100% - 32px))",

          margin:
            "20px auto",

          padding:
            "22px",

          borderRadius:
            "20px",

          background:
            "#fff",
        }}
      >
        <div
          style={{
            padding:
              "26px",

            borderRadius:
              "18px",

            color:
              "#fff",

            background:
              `linear-gradient(135deg, ${game.accent}, ${game.accent2}, #111820)`,
          }}
        >
          <div
            style={{
              fontSize:
                "12px",

              fontWeight:
                900,
            }}
          >
            POPULARES HOY Â· #{game.rank}
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
              "12px",

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

  if (!game?.id) {
    return null;
  }

  if (
    game.overlayType ===
      "video" &&
    game.videoUrl
  ) {
    return (
      <VideoOverlay
        game={game}
        onClose={onClose}
      />
    );
  }

  if (game.mock) {
    return (
      <MockGameCard
        game={game}
        onClose={onClose}
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
          Ã
        </button>
      </div>

      <div className="ranking-overlay-frame-wrap">
        <iframe
          className="ranking-overlay-frame"
          src={gameUrl}
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
