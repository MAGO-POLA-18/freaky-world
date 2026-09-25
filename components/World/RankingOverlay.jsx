"use client";

import {
  useEffect,
} from "react";

/* =========================================================
   FREAKY RANKING
========================================================= */

const FREAKY_RANKING_URL =
  "https://freakyranking.base44.app";

/* =========================================================
   FICHA FICTICIA LOCAL

   Se usa mientras diseñamos la experiencia 3D.

   IMPORTANTE:
   vive FUERA del Canvas.
========================================================= */

function MockGameCard({
  game,
  onClose,
}) {
  return (
    <div
      className="ranking-overlay ranking-overlay-live"
      role="dialog"
      aria-modal="true"
      aria-label={
        `Ficha de ${game.title}`
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
          "#eceae4",

        color:
          "#171b1e",

        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* =================================================
          BARRA SUPERIOR
      ================================================= */}

      <div
        style={{
          flex:
            "0 0 auto",

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
              fontSize:
                "10px",

              letterSpacing:
                ".14em",

              fontWeight:
                900,

              color:
                game.accent,
            }}
          >
            FREAKY WORLD
          </div>

          <strong
            style={{
              display:
                "block",

              marginTop:
                "2px",

              fontSize:
                "15px",
            }}
          >
            {game.title}
          </strong>
        </div>

        <button
          type="button"
          onClick={
            onClose
          }
          aria-label="Cerrar ficha"
          style={{
            width:
              "42px",

            height:
              "42px",

            flex:
              "0 0 42px",

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

      {/* =================================================
          CONTENIDO SCROLL
      ================================================= */}

      <div
        style={{
          flex:
            "1 1 auto",

          overflowY:
            "auto",

          WebkitOverflowScrolling:
            "touch",

          padding:
            "18px",

          boxSizing:
            "border-box",
        }}
      >
        <div
          style={{
            width:
              "min(900px, 100%)",

            margin:
              "0 auto",

            borderRadius:
              "22px",

            overflow:
              "hidden",

            background:
              "#fff",

            boxShadow:
              "0 18px 55px rgba(0,0,0,.18)",
          }}
        >
          {/* ===============================================
              HERO
          =============================================== */}

          <div
            style={{
              position:
                "relative",

              minHeight:
                "260px",

              padding:
                "25px",

              boxSizing:
                "border-box",

              display:
                "flex",

              flexDirection:
                "column",

              justifyContent:
                "flex-end",

              color:
                "#fff",

              background:
                `linear-gradient(
                  135deg,
                  ${game.accent} 0%,
                  ${game.accent2} 48%,
                  #111820 100%
                )`,
            }}
          >
            {/* círculo decorativo */}

            <div
              style={{
                position:
                  "absolute",

                width:
                  "250px",

                height:
                  "250px",

                right:
                  "-70px",

                top:
                  "-80px",

                borderRadius:
                  "50%",

                background:
                  "rgba(255,255,255,.12)",
              }}
            />

            <div
              style={{
                position:
                  "relative",

                zIndex:
                  2,

                fontSize:
                  "12px",

                fontWeight:
                  900,

                letterSpacing:
                  ".12em",
              }}
            >
              POPULARES HOY · #{game.rank}
            </div>

            <h1
              style={{
                position:
                  "relative",

                zIndex:
                  2,

                margin:
                  "10px 0 0",

                maxWidth:
                  "720px",

                fontSize:
                  "clamp(36px, 8vw, 72px)",

                lineHeight:
                  .93,
              }}
            >
              {game.title}
            </h1>

            <div
              style={{
                position:
                  "relative",

                zIndex:
                  2,

                marginTop:
                  "12px",

                opacity:
                  .82,

                fontWeight:
                  650,
              }}
            >
              {game.subtitle}
            </div>
          </div>

          {/* ===============================================
              DATOS
          =============================================== */}

          <div
            style={{
              padding:
                "20px",
            }}
          >
            <div
              style={{
                display:
                  "grid",

                gridTemplateColumns:
                  "100px minmax(0,1fr)",

                gap:
                  "12px",
              }}
            >
              {/* puntuación */}

              <div
                style={{
                  minHeight:
                    "92px",

                  borderRadius:
                    "16px",

                  display:
                    "flex",

                  flexDirection:
                    "column",

                  alignItems:
                    "center",

                  justifyContent:
                    "center",

                  background:
                    "#151a1e",

                  color:
                    "#fff",
                }}
              >
                <small
                  style={{
                    opacity:
                      .6,

                    fontWeight:
                      800,
                  }}
                >
                  FREAKY
                </small>

                <strong
                  style={{
                    marginTop:
                      "2px",

                    fontSize:
                      "32px",

                    color:
                      game.accent,
                  }}
                >
                  {game.score}
                </strong>
              </div>

              {/* meta */}

              <div
                style={{
                  minHeight:
                    "92px",

                  padding:
                    "14px",

                  boxSizing:
                    "border-box",

                  borderRadius:
                    "16px",

                  background:
                    "#eeece6",
                }}
              >
                <strong>
                  {game.genre}
                </strong>

                <div
                  style={{
                    marginTop:
                      "7px",

                    color:
                      "#60686d",

                    fontSize:
                      "14px",

                    lineHeight:
                      1.5,
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
                margin:
                  "19px 0",

                color:
                  "#50585d",

                fontSize:
                  "16px",

                lineHeight:
                  1.6,
              }}
            >
              {game.description}
            </p>

            {/* ===============================================
                PREVIEW DE VÍDEO

                Por ahora imagen gráfica.
                No cargamos iframe.
            =============================================== */}

            <div
              style={{
                position:
                  "relative",

                width:
                  "100%",

                aspectRatio:
                  "16 / 9",

                overflow:
                  "hidden",

                borderRadius:
                  "18px",

                background:
                  `linear-gradient(
                    145deg,
                    ${game.accent2},
                    #101820 62%
                  )`,
              }}
            >
              <div
                style={{
                  position:
                    "absolute",

                  width:
                    "55%",

                  aspectRatio:
                    "1",

                  right:
                    "-10%",

                  top:
                    "-35%",

                  borderRadius:
                    "50%",

                  background:
                    `${game.accent}55`,
                }}
              />

              <div
                style={{
                  position:
                    "absolute",

                  inset:
                    0,

                  display:
                    "flex",

                  alignItems:
                    "center",

                  justifyContent:
                    "center",
                }}
              >
                <div
                  style={{
                    width:
                      "70px",

                    height:
                      "70px",

                    borderRadius:
                      "50%",

                    display:
                      "flex",

                    alignItems:
                      "center",

                    justifyContent:
                      "center",

                    paddingLeft:
                      "5px",

                    background:
                      "#fff",

                    color:
                      "#111",

                    fontSize:
                      "29px",

                    boxShadow:
                      "0 10px 35px rgba(0,0,0,.35)",
                  }}
                >
                  ▶
                </div>
              </div>

              <div
                style={{
                  position:
                    "absolute",

                  left:
                    "17px",

                  bottom:
                    "15px",

                  color:
                    "#fff",

                  fontSize:
                    "14px",

                  fontWeight:
                    800,
                }}
              >
                Vídeo destacado
              </div>
            </div>

            {/* ===============================================
                ACCIONES
            =============================================== */}

            <div
              style={{
                display:
                  "flex",

                flexWrap:
                  "wrap",

                gap:
                  "9px",

                marginTop:
                  "20px",
              }}
            >
              <button
                type="button"
                style={{
                  border:
                    0,

                  borderRadius:
                    "12px",

                  padding:
                    "12px 16px",

                  background:
                    game.accent,

                  color:
                    "#111",

                  fontWeight:
                    900,
                }}
              >
                Ver ficha completa
              </button>

              <button
                type="button"
                style={{
                  border:
                    "1px solid #d0d3d4",

                  borderRadius:
                    "12px",

                  padding:
                    "12px 16px",

                  background:
                    "#fff",

                  color:
                    "#222",

                  fontWeight:
                    700,
                }}
              >
                Calificar
              </button>

              <button
                type="button"
                onClick={
                  onClose
                }
                style={{
                  border:
                    "1px solid #d0d3d4",

                  borderRadius:
                    "12px",

                  padding:
                    "12px 16px",

                  background:
                    "#fff",

                  color:
                    "#222",
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
   OVERLAY
========================================================= */

export default function RankingOverlay({
  game,
  onClose,
}) {
  /* =======================================================
     BLOQUEAR SCROLL
  ======================================================= */

  useEffect(() => {
    const previousOverflow =
      document.body.style
        .overflow;

    document.body.style
      .overflow =
      "hidden";

    return () => {
      document.body.style
        .overflow =
        previousOverflow;
    };
  }, []);

  /* =======================================================
     SIN JUEGO
  ======================================================= */

  if (!game?.id) {
    return null;
  }

  /* =======================================================
     FICHA FICTICIA

     NO usa iframe.
  ======================================================= */

  if (game.mock) {
    return (
      <MockGameCard
        game={game}
        onClose={onClose}
      />
    );
  }

  /* =======================================================
     FICHA REAL DE FREAKY RANKING

     Esto queda preparado para después.
  ======================================================= */

  const gameUrl =
    `${FREAKY_RANKING_URL}/game/${game.id}`;

  return (
    <div
      className="ranking-overlay ranking-overlay-live"
      role="dialog"
      aria-modal="true"
      aria-label={
        `Ficha de ${
          game.title ||
          "juego"
        }`
      }
    >
      <div className="ranking-overlay-live-bar">
        <div className="ranking-overlay-live-title">
          <span className="ranking-overlay-kicker">
            FREAKY WORLD
          </span>

          <strong>
            {
              game.title ||
              "Ficha del juego"
            }
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
