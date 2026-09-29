"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

/* =========================================================
   FREAKY WORLD
   PLATFORM GAMES OVERLAY

   Catálogo de juegos de una consola.

   Espera:
   - platformId
   - platformName
   - onClose
   - onOpenGame

   API:
   /api/platform-games?platform=ID&page=1&limit=24
========================================================= */

const PAGE_SIZE = 24;

/* =========================================================
   SCORE
========================================================= */

function getGameScore(game) {
  const official =
    Number(
      game?.freakyOfficialScore
    );

  if (
    Number.isFinite(official) &&
    official > 0
  ) {
    return {
      value:
        official.toFixed(1),
      label: "OFICIAL",
    };
  }

  const community =
    Number(
      game?.communityScore
    );

  if (
    Number.isFinite(community) &&
    community > 0
  ) {
    return {
      value:
        community.toFixed(1),
      label: "COMUNIDAD",
    };
  }

  const total =
    Number(
      game?.totalRating
    );

  if (
    Number.isFinite(total) &&
    total > 0
  ) {
    return {
      value:
        (total / 10).toFixed(
          1
        ),
      label: "IGDB",
    };
  }

  const rating =
    Number(
      game?.rating
    );

  if (
    Number.isFinite(rating) &&
    rating > 0
  ) {
    return {
      value:
        (rating / 10).toFixed(
          1
        ),
      label: "IGDB",
    };
  }

  return null;
}

/* =========================================================
   COVER
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
   GAME CARD
========================================================= */

function GameCard({
  game,
  onOpen,
}) {
  const cover =
    getCover(game);

  const score =
    getGameScore(game);

  return (
    <button
      type="button"
      onClick={() =>
        onOpen?.(game)
      }
      style={{
        display: "block",

        width: "100%",

        padding: 0,

        overflow: "hidden",

        border:
          "1px solid rgba(255,255,255,0.09)",

        borderRadius: 14,

        background:
          "rgba(255,255,255,0.045)",

        color: "#ffffff",

        textAlign: "left",

        cursor: "pointer",
      }}
    >
      {/* PORTADA */}

      <div
        style={{
          position:
            "relative",

          aspectRatio: "3 / 4",

          overflow: "hidden",

          background:
            "#181b21",
        }}
      >
        {cover ? (
          <img
            src={cover}
            alt={game.name}
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",

              display:
                "block",

              objectFit:
                "cover",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",

              display: "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              padding: 12,

              boxSizing:
                "border-box",

              textAlign:
                "center",

              fontSize: 12,

              fontWeight: 750,

              opacity: 0.45,
            }}
          >
            {game.name}
          </div>
        )}

        {/* SCORE */}

        {score && (
          <div
            style={{
              position:
                "absolute",

              top: 8,
              right: 8,

              minWidth: 37,

              padding:
                "6px 7px",

              borderRadius: 9,

              background:
                "rgba(6,8,12,0.88)",

              backdropFilter:
                "blur(10px)",

              WebkitBackdropFilter:
                "blur(10px)",

              textAlign:
                "center",
            }}
          >
            <div
              style={{
                fontSize: 14,

                lineHeight: 1,

                fontWeight: 850,
              }}
            >
              {score.value}
            </div>

            <div
              style={{
                marginTop: 3,

                fontSize: 6,

                letterSpacing:
                  0.6,

                opacity: 0.5,
              }}
            >
              {score.label}
            </div>
          </div>
        )}
      </div>

      {/* INFO */}

      <div
        style={{
          padding:
            "10px 10px 11px",
        }}
      >
        <div
          style={{
            display:
              "-webkit-box",

            minHeight: 34,

            overflow:
              "hidden",

            WebkitLineClamp: 2,

            WebkitBoxOrient:
              "vertical",

            fontSize: 12,

            lineHeight: 1.35,

            fontWeight: 760,
          }}
        >
          {game.name}
        </div>

        <div
          style={{
            display: "flex",

            justifyContent:
              "space-between",

            alignItems:
              "center",

            gap: 8,

            marginTop: 7,

            fontSize: 9,

            opacity: 0.5,
          }}
        >
          <span>
            {game.year ||
              "—"}
          </span>

          <span
            style={{
              overflow:
                "hidden",

              whiteSpace:
                "nowrap",

              textOverflow:
                "ellipsis",
            }}
          >
            {game.developer ||
              game.publisher ||
              ""}
          </span>
        </div>
      </div>
    </button>
  );
}

/* =========================================================
   OVERLAY
========================================================= */

export default function PlatformGamesOverlay({
  platformId,
  platformName,
  onClose,
  onOpenGame,
}) {
  const [
    games,
    setGames,
  ] = useState([]);

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    hasMore,
    setHasMore,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState(null);

  const [
    search,
    setSearch,
  ] = useState("");

  /* =======================================================
     RESET CUANDO CAMBIA PLATAFORMA
  ======================================================= */

  useEffect(() => {
    setGames([]);
    setPage(1);
    setHasMore(false);
    setError(null);
    setSearch("");
  }, [platformId]);

  /* =======================================================
     CERRAR ESC
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

  /* =======================================================
     FETCH
  ======================================================= */

  useEffect(() => {
    if (!platformId) {
      return;
    }

    let cancelled = false;

    async function loadGames() {
      try {
        setLoading(true);
        setError(null);

        const response =
          await fetch(
            `/api/platform-games?platform=${encodeURIComponent(
              platformId
            )}&page=${page}&limit=${PAGE_SIZE}`,
            {
              cache:
                "no-store",
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "No se pudieron cargar los juegos."
          );
        }

        if (cancelled) {
          return;
        }

        setGames(
          Array.isArray(
            data?.games
          )
            ? data.games
            : []
        );

        setHasMore(
          Boolean(
            data?.pagination
              ?.hasMore
          )
        );
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        setError(
          loadError instanceof
            Error
            ? loadError.message
            : "Error cargando juegos."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadGames();

    return () => {
      cancelled = true;
    };
  }, [
    platformId,
    page,
  ]);

  /* =======================================================
     BÚSQUEDA LOCAL DE ESTA PÁGINA
  ======================================================= */

  const visibleGames =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return games;
      }

      return games.filter(
        (game) => {
          const haystack = [
            game?.name,
            game?.developer,
            game?.publisher,
            game?.year,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return haystack.includes(
            query
          );
        }
      );
    }, [
      games,
      search,
    ]);

  /* =======================================================
     SIN PLATFORM ID
  ======================================================= */

  if (!platformId) {
    return (
      <div
        style={overlayStyle}
      >
        <div
          style={panelStyle}
        >
          <button
            type="button"
            onClick={onClose}
            style={
              closeButtonStyle
            }
          >
            ×
          </button>

          <div
            style={{
              padding: 30,
              textAlign:
                "center",
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
              }}
            >
              Plataforma no conectada
            </div>

            <div
              style={{
                marginTop: 8,

                fontSize: 12,

                opacity: 0.55,
              }}
            >
              Todavía falta asignar el
              platformId real de esta
              consola.
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div
      style={overlayStyle}
      onClick={onClose}
    >
      <div
        style={panelStyle}
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div
          style={{
            position:
              "sticky",

            top: 0,

            zIndex: 10,

            padding:
              "18px 18px 14px",

            background:
              "rgba(11,13,18,0.97)",

            borderBottom:
              "1px solid rgba(255,255,255,0.08)",

            backdropFilter:
              "blur(16px)",

            WebkitBackdropFilter:
              "blur(16px)",
          }}
        >
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            style={
              closeButtonStyle
            }
          >
            ×
          </button>

          <div
            style={{
              paddingRight: 45,
            }}
          >
            <div
              style={{
                fontSize: 10,

                letterSpacing:
                  1.5,

                textTransform:
                  "uppercase",

                opacity: 0.45,
              }}
            >
              Catálogo
            </div>

            <div
              style={{
                marginTop: 3,

                fontSize: 23,

                fontWeight: 850,

                letterSpacing:
                  -0.5,
              }}
            >
              Juegos de{" "}
              {platformName ||
                "la consola"}
            </div>
          </div>

          {/* BUSCADOR */}

          <div
            style={{
              marginTop: 14,
            }}
          >
            <input
              value={search}
              onChange={(
                event
              ) =>
                setSearch(
                  event.target
                    .value
                )
              }
              placeholder="Buscar en esta página..."
              style={{
                width: "100%",

                height: 42,

                padding:
                  "0 13px",

                boxSizing:
                  "border-box",

                border:
                  "1px solid rgba(255,255,255,0.1)",

                borderRadius: 12,

                outline: "none",

                background:
                  "rgba(255,255,255,0.055)",

                color:
                  "#ffffff",

                fontSize: 13,
              }}
            />
          </div>
        </div>

        {/* =================================================
            BODY
        ================================================= */}

        <div
          style={{
            padding: 18,
          }}
        >
          {/* LOADING */}

          {loading && (
            <div
              style={{
                padding:
                  "50px 20px",

                textAlign:
                  "center",

                fontSize: 12,

                opacity: 0.55,
              }}
            >
              Cargando juegos...
            </div>
          )}

          {/* ERROR */}

          {!loading &&
            error && (
              <div
                style={{
                  padding:
                    "26px 18px",

                  borderRadius: 14,

                  background:
                    "rgba(255,80,80,0.08)",

                  border:
                    "1px solid rgba(255,80,80,0.16)",

                  fontSize: 12,

                  lineHeight: 1.5,

                  color:
                    "#ffbcbc",
                }}
              >
                {error}
              </div>
            )}

          {/* VACÍO */}

          {!loading &&
            !error &&
            visibleGames.length ===
              0 && (
              <div
                style={{
                  padding:
                    "50px 20px",

                  textAlign:
                    "center",

                  fontSize: 12,

                  opacity: 0.5,
                }}
              >
                No hay juegos para
                mostrar.
              </div>
            )}

          {/* GRID */}

          {!loading &&
            !error &&
            visibleGames.length >
              0 && (
              <div
                style={{
                  display: "grid",

                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(115px, 1fr))",

                  gap: 12,
                }}
              >
                {visibleGames.map(
                  (game) => (
                    <GameCard
                      key={
                        game.id
                      }
                      game={game}
                      onOpen={
                        onOpenGame
                      }
                    />
                  )
                )}
              </div>
            )}

          {/* =================================================
              PAGINACIÓN
          ================================================= */}

          {!loading &&
            !error &&
            games.length >
              0 && (
              <div
                style={{
                  display: "flex",

                  justifyContent:
                    "center",

                  alignItems:
                    "center",

                  gap: 10,

                  marginTop: 22,

                  paddingBottom: 8,
                }}
              >
                <button
                  type="button"
                  disabled={
                    page <= 1
                  }
                  onClick={() =>
                    setPage(
                      (
                        current
                      ) =>
                        Math.max(
                          1,
                          current -
                            1
                        )
                    )
                  }
                  style={{
                    ...paginationButtonStyle,

                    opacity:
                      page <= 1
                        ? 0.3
                        : 1,
                  }}
                >
                  ‹
                </button>

                <div
                  style={{
                    minWidth: 70,

                    textAlign:
                      "center",

                    fontSize: 11,

                    opacity: 0.6,
                  }}
                >
                  Página {page}
                </div>

                <button
                  type="button"
                  disabled={
                    !hasMore
                  }
                  onClick={() =>
                    setPage(
                      (
                        current
                      ) =>
                        current +
                        1
                    )
                  }
                  style={{
                    ...paginationButtonStyle,

                    opacity:
                      hasMore
                        ? 1
                        : 0.3,
                  }}
                >
                  ›
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   STYLES
========================================================= */

const overlayStyle = {
  position: "fixed",

  inset: 0,

  zIndex: 10000,

  display: "flex",

  alignItems: "center",

  justifyContent:
    "center",

  padding: 14,

  boxSizing:
    "border-box",

  background:
    "rgba(3,4,7,0.72)",

  backdropFilter:
    "blur(6px)",

  WebkitBackdropFilter:
    "blur(6px)",
};

const panelStyle = {
  position: "relative",

  width:
    "min(920px, 100%)",

  height:
    "min(760px, calc(100vh - 28px))",

  overflowY: "auto",

  border:
    "1px solid rgba(255,255,255,0.12)",

  borderRadius: 20,

  background:
    "#0b0d12",

  boxShadow:
    "0 30px 100px rgba(0,0,0,0.65)",

  color: "#ffffff",

  fontFamily:
    "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
};

const closeButtonStyle = {
  position: "absolute",

  top: 13,
  right: 13,

  zIndex: 20,

  width: 34,
  height: 34,

  padding: 0,

  border: 0,

  borderRadius: 999,

  background:
    "rgba(255,255,255,0.09)",

  color: "#ffffff",

  fontSize: 20,

  cursor: "pointer",
};

const paginationButtonStyle = {
  width: 40,
  height: 40,

  border:
    "1px solid rgba(255,255,255,0.1)",

  borderRadius: 11,

  background:
    "rgba(255,255,255,0.06)",

  color: "#ffffff",

  fontSize: 22,

  cursor: "pointer",
};
