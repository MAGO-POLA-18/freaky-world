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
   OVERLAY 2D

   Carga la ficha real dentro de Freaky World.

   El mundo 3D queda vivo detrás.
========================================================= */

export default function RankingOverlay({
  game,
  onClose,
}) {
  /* =======================================================
     BLOQUEAR SCROLL EXTERNO
  ======================================================= */

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

  /* =======================================================
     SIN JUEGO
  ======================================================= */

  if (!game?.id) {
    return null;
  }

  /* =======================================================
     URL DE LA FICHA
  ======================================================= */

  const gameUrl =
    `${FREAKY_RANKING_URL}/game/${game.id}`;

  return (
    <div
      className="ranking-overlay ranking-overlay-live"
      role="dialog"
      aria-modal="true"
      aria-label={
        `Ficha de ${game.title || "juego"}`
      }
    >
      {/* =================================================
          BARRA SUPERIOR
      ================================================= */}

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

      {/* =================================================
          FICHA REAL
      ================================================= */}

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
