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
   VIDEO 2D

   Usa exactamente game.videoUrl,
   la misma fuente que usa la pantalla 3D.
========================================================= */

function VideoOverlay({
  game,
  onClose,
}) {
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
          ×
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
          ×
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
