"use client";

/* =========================================================
   RANKING 2D — PROTOTIPO

   Más adelante esto podrá conectarse
   al Freaky Ranking real.
========================================================= */

const demoGames = [
  {
    position: 1,
    title:
      "The Legend of Zelda: Ocarina of Time",
    score: "9.8",
    year: 1998,
  },

  {
    position: 2,
    title:
      "Metal Gear Solid",
    score: "9.6",
    year: 1998,
  },

  {
    position: 3,
    title:
      "Super Mario 64",
    score: "9.5",
    year: 1996,
  },

  {
    position: 4,
    title:
      "Half-Life 2",
    score: "9.4",
    year: 2004,
  },

  {
    position: 5,
    title:
      "Resident Evil 4",
    score: "9.3",
    year: 2005,
  },
];

export default function RankingOverlay({
  onClose,
}) {
  return (
    <div
      className="ranking-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Ranking Board"
    >
      {/* =================================================
          CABECERA
      ================================================= */}

      <header className="ranking-overlay-header">
        <div>
          <div className="ranking-overlay-kicker">
            FREAKY WORLD
          </div>

          <h1>
            Ranking Board
          </h1>

          <p>
            Play de Web
          </p>
        </div>

        <button
          type="button"
          className="ranking-overlay-close"
          onClick={onClose}
          aria-label="Cerrar Ranking"
        >
          ×
        </button>
      </header>

      {/* =================================================
          CONTENIDO
      ================================================= */}

      <main className="ranking-overlay-content">
        <section className="ranking-overlay-intro">
          <span className="ranking-demo-badge">
            PROTOTIPO
          </span>

          <h2>
            Mejores puntuados
          </h2>

          <p>
            Esta es la primera prueba
            de navegación entre el mundo
            3D y una interfaz 2D.
          </p>
        </section>

        {/* =================================================
            LISTA
        ================================================= */}

        <section className="ranking-demo-list">
          {demoGames.map(
            (game) => (
              <article
                key={
                  game.position
                }
                className="ranking-demo-row"
              >
                <div className="ranking-demo-position">
                  {game.position}
                </div>

                <div className="ranking-demo-game">
                  <strong>
                    {game.title}
                  </strong>

                  <span>
                    {game.year}
                  </span>
                </div>

                <div className="ranking-demo-score">
                  {game.score}
                </div>
              </article>
            )
          )}
        </section>

        {/* =================================================
            FUTURO
        ================================================= */}

        <section className="ranking-overlay-future">
          <span>
            Después podremos abrir
            fichas reales, buscar juegos
            y volver al mundo 3D sin
            perder nuestra posición.
          </span>
        </section>
      </main>
    </div>
  );
}
