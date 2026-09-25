"use client";

import { useEffect } from "react";

/* =========================================================
   CONFIG
========================================================= */

const FREAKY_RANKING_URL =
  "https://freakyranking.base44.app";

/* =========================================================
   OVERLAY DE VIDEO
========================================================= */

function VideoOverlay({
  game,
  onClose,
}) {
  const embedUrl =
    game.youtubeEmbed ||
    "https://www.youtube.com/embed/M7lc1UVf-VE?autoplay=1&rel=0&playsinline=1";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={game.title || "Video"}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        background:
          "linear-gradient(180deg, #05070a 0%, #0a0f14 100%)",
        color: "#fff",
        fontFamily:
          "system-ui,-apple-system,BlinkMacSystemFont,sans-serif",
      }}
    >
      {/* TOP BAR */}
      <div
        style={{
          flex: "0 0 auto",
          minHeight: "58px",
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "14px",
          background: "rgba(8,10,14,.92)",
          borderBottom: `2px solid ${game.accent || "#5cf2ff"}`,
        }}
      >
        <div>
          <div
            style={{
              fontSize: "10px",
              letterSpacing: ".14em",
              fontWeight: 900,
              color: game.accent || "#5cf2ff",
            }}
          >
            FREAKY WORLD · FEATURED SCREEN
          </div>

          <strong
            style={{
              display: "block",
              marginTop: "2px",
              fontSize: "15px",
            }}
          >
            {game.title || "Pantalla destacada"}
          </strong>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar vídeo"
          style={{
            width: "42px",
            height: "42px",
            flex: "0 0 42px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,.18)",
            background: "#1d2329",
            color: "#fff",
            fontSize: "24px",
          }}
        >
          ×
        </button>
      </div>

      {/* CONTENT */}
      <div
        style={{
          flex: "1 1 auto",
          minHeight: 0,
          display: "grid",
          gridTemplateColumns: "1fr",
          padding: "14px",
          gap: "14px",
          boxSizing: "border-box",
          overflow: "auto",
        }}
      >
        <div
          style={{
            width: "min(1200px, 100%)",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr)",
            gap: "14px",
          }}
        >
          {/* VIDEO */}
          <div
            style={{
              borderRadius: "18px",
              overflow: "hidden",
              background: "#000",
              boxShadow:
                "0 18px 55px rgba(0,0,0,.45), 0 0 0 1px rgba(255,255,255,.06) inset",
            }}
          >
            <div
              style={{
                width: "100%",
                aspectRatio: "16 / 9",
                background: "#000",
              }}
            >
              <iframe
                src={embedUrl}
                title={game.title || "YouTube video"}
                width="100%"
                height="100%"
                style={{
                  border: 0,
                  width: "100%",
                  height: "100%",
                  display: "block",
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                allowFullScreen
              />
            </div>
          </div>

          {/* INFO */}
          <div
            style={{
              borderRadius: "18px",
              padding: "18px",
              background:
                "linear-gradient(145deg, rgba(18,22,29,.95), rgba(12,15,20,.95))",
              boxShadow:
                "0 10px 30px rgba(0,0,0,.25)",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                letterSpacing: ".12em",
                fontWeight: 900,
                color: game.accent || "#5cf2ff",
              }}
            >
              VIDEO EMBEBIDO
            </div>

            <h2
              style={{
                margin: "10px 0 8px",
                fontSize: "clamp(28px, 6vw, 54px)",
                lineHeight: 0.96,
              }}
            >
              {game.title || "Pantalla gigante"}
            </h2>

            <p
              style={{
                margin: 0,
                color: "rgba(255,255,255,.75)",
                lineHeight: 1.6,
                fontSize: "15px",
              }}
            >
              {game.description ||
                "Esta pantalla simula una sala destacada dentro de Freaky World. El vídeo queda embebido como una página web y puede ampliarse a pantalla completa desde el propio reproductor de YouTube."}
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                marginTop: "18px",
              }}
            >
              <button
                type="button"
                onClick={onClose}
                style={{
                  border: 0,
                  borderRadius: "12px",
                  padding: "12px 16px",
                  background: game.accent || "#5cf2ff",
                  color: "#101215",
                  fontWeight: 900,
                }}
              >
                Volver al mundo
              </button>

              <a
                href={game.youtubePage || "https://www.youtube.com/watch?v=M7lc1UVf-VE"}
                target="_blank"
                rel="noreferrer"
                style={{
                  borderRadius: "12px",
                  padding: "12px 16px",
                  background: "transparent",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,.18)",
                  textDecoration: "none",
                  fontWeight: 700,
                }}
              >
                Abrir en YouTube
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   FICHA FICTICIA
========================================================= */

function MockGameCard({
  game,
  onClose,
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        background: "#eceae4",
        color: "#171b1e",
        fontFamily:
          "system-ui,-apple-system,BlinkMacSystemFont,sans-serif",
      }}
    >
      <div
        style={{
          flex: "0 0 auto",
          minHeight: "58px",
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "14px",
          background: "#11161a",
          color: "#fff",
          borderBottom: `3px solid ${game.accent}`,
        }}
      >
        <div>
          <div
            style={{
              fontSize: "10px",
              letterSpacing: ".14em",
              fontWeight: 900,
              color: game.accent,
            }}
          >
            FREAKY WORLD
          </div>

          <strong
            style={{
              display: "block",
              marginTop: "2px",
              fontSize: "15px",
            }}
          >
            {game.title}
          </strong>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar ficha"
          style={{
            width: "42px",
            height: "42px",
            flex: "0 0 42px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,.2)",
            background: "#252b30",
            color: "#fff",
            fontSize: "24px",
          }}
        >
          ×
        </button>
      </div>

      <div
        style={{
          flex: "1 1 auto",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          padding: "18px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "min(900px, 100%)",
            margin: "0 auto",
            borderRadius: "22px",
            overflow: "hidden",
            background: "#fff",
            boxShadow: "0 18px 55px rgba(0,0,0,.18)",
          }}
        >
          <div
            style={{
              position: "relative",
              minHeight: "260px",
              padding: "25px",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              color: "#fff",
              background: `linear-gradient(135deg, ${game.accent} 0%, ${game.accent2} 48%, #111820 100%)`,
            }}
          >
            <div
              style={{
                position: "absolute",
                width: "250px",
                height: "250px",
                right: "-70px",
                top: "-80px",
                borderRadius: "50%",
                background: "rgba(255,255,255,.12)",
              }}
            />

            <div
              style={{
                position: "relative",
                zIndex: 2,
                fontSize: "12px",
                fontWeight: 900,
                letterSpacing: ".12em",
              }}
            >
              POPULARES HOY · #{game.rank}
            </div>

            <h1
              style={{
                position: "relative",
                zIndex: 2,
                margin: "10px 0 0",
                maxWidth: "720px",
                fontSize: "clamp(36px, 8vw, 72px)",
                lineHeight: 0.93,
              }}
            >
              {game.title}
            </h1>

            <div
              style={{
                position: "relative",
                zIndex: 2,
                marginTop: "12px",
                opacity: 0.82,
                fontWeight: 650,
              }}
            >
              {game.subtitle}
            </div>
          </div>

          <div
            style={{
              padding: "20px",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "100px minmax(0,1fr)",
                gap: "12px",
              }}
            >
              <div
                style={{
                  minHeight: "92px",
                  borderRadius: "16px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#151a1e",
                  color: "#fff",
                }}
              >
                <small
                  style={{
                    opacity: 0.6,
                    fontWeight: 800,
                  }}
                >
                  FREAKY
                </small>

                <strong
                  style={{
                    marginTop: "2px",
                    fontSize: "32px",
                    color: game.accent,
                  }}
                >
                  {game.score}
                </strong>
              </div>

              <div
                style={{
                  minHeight: "92px",
                  padding: "14px",
                  boxSizing: "border-box",
                  borderRadius: "16px",
                  background: "#eeece6",
                }}
              >
                <strong>{game.genre}</strong>

                <div
                  style={{
                    marginTop: "7px",
                    color: "#60686d",
                    fontSize: "14px",
                    lineHeight: 1.5,
                  }}
                >
                  {game.year}
                  <br />
                  {game.platform}
                </div>
              </div>
            </div>

            <p
              style={{
                margin: "19px 0",
                color: "#50585d",
                fontSize: "16px",
                lineHeight: 1.6,
              }}
            >
              {game.description}
            </p>

            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "16 / 9",
                overflow: "hidden",
                borderRadius: "18px",
                background: `linear-gradient(145deg, ${game.accent2}, #101820 62%)`,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: "55%",
                  aspectRatio: "1",
                  right: "-10%",
                  top: "-35%",
                  borderRadius: "50%",
                  background: `${game.accent}55`,
                }}
              />

              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: "70px",
                    height: "70px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingLeft: "5px",
                    background: "#fff",
                    color: "#111",
                    fontSize: "29px",
                    boxShadow: "0 10px 35px rgba(0,0,0,.35)",
                  }}
                >
                  ▶
                </div>
              </div>

              <div
                style={{
                  position: "absolute",
                  left: "17px",
                  bottom: "15px",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 800,
                }}
              >
                Vídeo destacado
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "9px",
                marginTop: "20px",
              }}
            >
              <button
                type="button"
                style={{
                  border: 0,
                  borderRadius: "12px",
                  padding: "12px 16px",
                  background: game.accent,
                  color: "#111",
                  fontWeight: 900,
                }}
              >
                Ver ficha completa
              </button>

              <button
                type="button"
                style={{
                  border: "1px solid #d0d3d4",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  background: "#fff",
                  color: "#222",
                  fontWeight: 700,
                }}
              >
                Calificar
              </button>

              <button
                type="button"
                onClick={onClose}
                style={{
                  border: "1px solid #d0d3d4",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  background: "#fff",
                  color: "#222",
                }}
              >
                Volver al mundo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   OVERLAY PRINCIPAL
========================================================= */

export default function RankingOverlay({
  game,
  onClose,
}) {
  useEffect(() => {
    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, []);

  if (!game?.id) {
    return null;
  }

  if (game.overlayType === "video") {
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
      role="dialog"
      aria-modal="true"
      aria-label={`Ficha de ${game.title || "juego"}`}
    >
      <div className="ranking-overlay-live-bar">
        <div className="ranking-overlay-live-title">
          <span className="ranking-overlay-kicker">
            FREAKY WORLD
          </span>

          <strong>
            {game.title || "Ficha del juego"}
          </strong>
        </div>

        <button
          type="button"
          className="ranking-overlay-close"
          onClick={onClose}
          aria-label="Cerrar ficha y volver al mundo"
        >
          ×
        </button>
      </div>

      <div className="ranking-overlay-frame-wrap">
        <iframe
          className="ranking-overlay-frame"
          src={gameUrl}
          title={game.title || "Freaky Ranking"}
          allow="fullscreen"
        />
      </div>
    </div>
  );
}
