"use client";

import {
  useEffect,
  useState,
} from "react";

/* =========================================================
   FREAKY WORLD
   PLATFORM GAMES OVERLAY

   - catálogo por plataforma
   - paginación
   - búsqueda remota
   - conserva estado al abrir una ficha
   - responsive vertical / horizontal
========================================================= */

const PAGE_SIZE = 24;
const SEARCH_DELAY = 320;

/* =========================================================
   VIEWPORT
========================================================= */

function getViewport() {
  if (
    typeof window ===
    "undefined"
  ) {
    return {
      width: 390,
      height: 700,
    };
  }

  const visual =
    window.visualViewport;

  return {
    width:
      visual?.width ||
      window.innerWidth ||
      390,

    height:
      visual?.height ||
      window.innerHeight ||
      700,
  };
}

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

      label:
        "OFICIAL",
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

      label:
        "COMUNIDAD",
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

      label:
        "IGDB",
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

      label:
        "IGDB",
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
    game?.coverLargeUrl ||
    game?.coverMediumUrl ||
    game?.coverSmallUrl ||
    null
  );
}

/* =========================================================
   GAME CARD
========================================================= */

function GameCard({
  game,
  onOpen,
  compact,
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
        display:
          "block",

        width:
          "100%",

        minWidth:
          0,

        padding:
          0,

        overflow:
          "hidden",

        border:
          "1px solid rgba(255,255,255,0.09)",

        borderRadius:
          compact
            ? 11
            : 14,

        background:
          "rgba(255,255,255,0.045)",

        color:
          "#ffffff",

        textAlign:
          "left",

        cursor:
          "pointer",

        touchAction:
          "manipulation",
      }}
    >
      {/* PORTADA */}

      <div
        style={{
          position:
            "relative",

          aspectRatio:
            "3 / 4",

          overflow:
            "hidden",

          background:
            "#181b21",
        }}
      >
        {cover ? (
          <img
            src={
              cover
            }
            alt={
              game?.name ||
              "Juego"
            }
            loading="lazy"
            draggable={
              false
            }
            style={{
              width:
                "100%",

              height:
                "100%",

              display:
                "block",

              objectFit:
                "cover",
            }}
          />
        ) : (
          <div
            style={{
              width:
                "100%",

              height:
                "100%",

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              padding:
                10,

              boxSizing:
                "border-box",

              textAlign:
                "center",

              fontSize:
                compact
                  ? 10
                  : 12,

              fontWeight:
                750,

              opacity:
                0.45,
            }}
          >
            {game?.name ||
              "Sin portada"}
          </div>
        )}

        {/* PUNTUACIÓN */}

        {score && (
          <div
            style={{
              position:
                "absolute",

              top:
                7,

              right:
                7,

              minWidth:
                34,

              padding:
                "5px 6px",

              borderRadius:
                8,

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
                fontSize:
                  compact
                    ? 12
                    : 14,

                lineHeight:
                  1,

                fontWeight:
                  850,
              }}
            >
              {score.value}
            </div>

            <div
              style={{
                marginTop:
                  3,

                fontSize:
                  6,

                letterSpacing:
                  0.6,

                opacity:
                  0.5,
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
            compact
              ? "8px 8px 9px"
              : "10px 10px 11px",
        }}
      >
        <div
          style={{
            display:
              "-webkit-box",

            minHeight:
              compact
                ? 30
                : 34,

            overflow:
              "hidden",

            WebkitLineClamp:
              2,

            WebkitBoxOrient:
              "vertical",

            fontSize:
              compact
                ? 10
                : 12,

            lineHeight:
              1.35,

            fontWeight:
              760,
          }}
        >
          {game?.name ||
            "Juego"}
        </div>

        <div
          style={{
            display:
              "flex",

            justifyContent:
              "space-between",

            alignItems:
              "center",

            gap:
              6,

            marginTop:
              6,

            fontSize:
              8,

            opacity:
              0.5,
          }}
        >
          <span>
            {game?.year ||
              "—"}
          </span>

          <span
            style={{
              minWidth:
                0,

              overflow:
                "hidden",

              whiteSpace:
                "nowrap",

              textOverflow:
                "ellipsis",
            }}
          >
            {game?.developer ||
              game?.publisher ||
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

  /*
    Cuando FullGameOverlay está encima,
    este catálogo sigue montado pero
    queda suspendido.
  */

  suspended = false,
}) {
  const [
    viewport,
    setViewport,
  ] = useState(
    getViewport
  );

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

  /*
    Búsqueda que realmente mandamos
    al servidor después del debounce.
  */

  const [
    debouncedSearch,
    setDebouncedSearch,
  ] = useState("");

  /* =======================================================
     VIEWPORT
  ======================================================= */

  useEffect(() => {
    function update() {
      setViewport(
        getViewport()
      );
    }

    update();

    window.addEventListener(
      "resize",
      update
    );

    window.addEventListener(
      "orientationchange",
      update
    );

    window.visualViewport
      ?.addEventListener(
        "resize",
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

      window.visualViewport
        ?.removeEventListener(
          "resize",
          update
        );
    };
  }, []);

  const landscape =
    viewport.width >
    viewport.height;

  const veryShort =
    viewport.height <
    430;

  /* =======================================================
     RESET AL CAMBIAR CONSOLA
  ======================================================= */

  useEffect(() => {
    setGames([]);

    setPage(1);

    setHasMore(false);

    setError(null);

    setSearch("");

    setDebouncedSearch("");
  }, [
    platformId,
  ]);

  /* =======================================================
     DEBOUNCE BUSCADOR

     Cada vez que escribimos:
     - esperamos un instante
     - volvemos a página 1
     - mandamos q a la API
  ======================================================= */

  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          const normalized =
            search.trim();

          setPage(1);

          setDebouncedSearch(
            normalized
          );
        },
        SEARCH_DELAY
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [
    search,
  ]);

  /* =======================================================
     ESC

     MUY IMPORTANTE:
     si hay una ficha de juego encima,
     este overlay NO debe reaccionar.
  ======================================================= */

  useEffect(() => {
    if (
      suspended
    ) {
      return;
    }

    function handleKeyDown(
      event
    ) {
      if (
        event.key !==
        "Escape"
      ) {
        return;
      }

      event.preventDefault();

      onClose?.();
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
  }, [
    onClose,
    suspended,
  ]);

  /* =======================================================
     FETCH

     AHORA LA BÚSQUEDA VA AL SERVIDOR.

     Ejemplo:

     /api/platform-games
       ?platform=7
       &q=metal gear
       &page=1
       &limit=24
  ======================================================= */

  useEffect(() => {
    if (
      !platformId
    ) {
      return;
    }

    let cancelled =
      false;

    const controller =
      new AbortController();

    async function loadGames() {
      try {
        setLoading(true);

        setError(null);

        const params =
          new URLSearchParams();

        params.set(
          "platform",
          String(platformId)
        );

        params.set(
          "page",
          String(page)
        );

        params.set(
          "limit",
          String(PAGE_SIZE)
        );

        if (
          debouncedSearch
        ) {
          params.set(
            "q",
            debouncedSearch
          );
        }

        const response =
          await fetch(
            `/api/platform-games?${params.toString()}`,
            {
              method:
                "GET",

              cache:
                "no-store",

              signal:
                controller.signal,
            }
          );

        const data =
          await response.json();

        if (
          !response.ok
        ) {
          throw new Error(
            data?.error ||
              "No se pudieron cargar los juegos."
          );
        }

        if (
          cancelled
        ) {
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
      } catch (
        loadError
      ) {
        if (
          loadError?.name ===
          "AbortError"
        ) {
          return;
        }

        if (
          cancelled
        ) {
          return;
        }

        setError(
          loadError instanceof
            Error
            ? loadError.message
            : "Error cargando juegos."
        );
      } finally {
        if (
          !cancelled
        ) {
          setLoading(false);
        }
      }
    }

    loadGames();

    return () => {
      cancelled = true;

      controller.abort();
    };
  }, [
    platformId,
    page,
    debouncedSearch,
  ]);

  /* =======================================================
     MEDIDAS
  ======================================================= */

  const outerPadding =
    landscape
      ? 8
      : 12;

  const panelHeight =
    Math.max(
      260,

      viewport.height -
        outerPadding * 2
    );

  /* =======================================================
     SIN PLATFORM ID
  ======================================================= */

  if (
    !platformId
  ) {
    return (
      <div
        style={{
          ...overlayStyle,

          padding:
            outerPadding,
        }}
      >
        <div
          style={{
            ...panelStyle,

            height:
              panelHeight,
          }}
        >
          <button
            type="button"
            onClick={
              onClose
            }
            style={
              closeButtonStyle
            }
          >
            ×
          </button>

          <div
            style={{
              padding:
                30,

              textAlign:
                "center",
            }}
          >
            <div
              style={{
                fontSize:
                  18,

                fontWeight:
                  800,
              }}
            >
              Plataforma no conectada
            </div>

            <div
              style={{
                marginTop:
                  8,

                fontSize:
                  12,

                opacity:
                  0.55,
              }}
            >
              Todavía falta asignar el platformId real.
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
      style={{
        ...overlayStyle,

        padding:
          outerPadding,

        /*
          Si hay FullGameOverlay encima:
          mantenemos este componente vivo
          pero no recibe interacciones.
        */

        pointerEvents:
          suspended
            ? "none"
            : "auto",

        visibility:
          suspended
            ? "hidden"
            : "visible",
      }}
      onClick={
        suspended
          ? undefined
          : onClose
      }
    >
      <div
        style={{
          ...panelStyle,

          height:
            panelHeight,

          borderRadius:
            landscape
              ? 14
              : 20,
        }}
        onClick={(
          event
        ) => {
          event.stopPropagation();
        }}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div
          style={{
            position:
              "sticky",

            top:
              0,

            zIndex:
              10,

            padding:
              landscape
                ? "10px 54px 10px 12px"
                : "18px 54px 14px 18px",

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
            onClick={
              onClose
            }
            style={
              closeButtonStyle
            }
          >
            ×
          </button>

          <div>
            {!veryShort && (
              <div
                style={{
                  fontSize:
                    9,

                  letterSpacing:
                    1.5,

                  textTransform:
                    "uppercase",

                  opacity:
                    0.45,
                }}
              >
                Catálogo
              </div>
            )}

            <div
              style={{
                marginTop:
                  veryShort
                    ? 0
                    : 3,

                fontSize:
                  landscape
                    ? 17
                    : 23,

                fontWeight:
                  850,

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
              marginTop:
                landscape
                  ? 8
                  : 14,
            }}
          >
            <input
              value={
                search
              }
              onChange={(
                event
              ) => {
                setSearch(
                  event.target
                    .value
                );
              }}
              placeholder={`Buscar en todo ${platformName || "el catálogo"}...`}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={
                false
              }
              style={{
                width:
                  "100%",

                height:
                  landscape
                    ? 38
                    : 42,

                padding:
                  "0 13px",

                boxSizing:
                  "border-box",

                border:
                  "1px solid rgba(255,255,255,0.1)",

                borderRadius:
                  11,

                outline:
                  "none",

                background:
                  "rgba(255,255,255,0.055)",

                color:
                  "#ffffff",

                /*
                  16px evita zoom automático
                  de Safari/iPhone.
                */

                fontSize:
                  16,
              }}
            />
          </div>

          {/* ESTADO DE BÚSQUEDA */}

          {debouncedSearch && (
            <div
              style={{
                marginTop:
                  7,

                fontSize:
                  9,

                color:
                  "#7f8a90",
              }}
            >
              Buscando en todo el catálogo:{" "}
              <strong
                style={{
                  color:
                    "#d5dadd",
                }}
              >
                {debouncedSearch}
              </strong>
            </div>
          )}
        </div>

        {/* =================================================
            BODY
        ================================================= */}

        <div
          style={{
            padding:
              landscape
                ? 10
                : 18,
          }}
        >
          {/* LOADING */}

          {loading && (
            <div
              style={{
                padding:
                  "40px 20px",

                textAlign:
                  "center",

                fontSize:
                  12,

                opacity:
                  0.55,
              }}
            >
              {debouncedSearch
                ? "Buscando juegos..."
                : "Cargando juegos..."}
            </div>
          )}

          {/* ERROR */}

          {!loading &&
            error && (
              <div
                style={{
                  padding:
                    "20px 16px",

                  borderRadius:
                    14,

                  background:
                    "rgba(255,80,80,0.08)",

                  border:
                    "1px solid rgba(255,80,80,0.16)",

                  fontSize:
                    12,

                  lineHeight:
                    1.5,

                  color:
                    "#ffbcbc",
                }}
              >
                {error}
              </div>
            )}

          {/* SIN RESULTADOS */}

          {!loading &&
            !error &&
            games.length ===
              0 && (
              <div
                style={{
                  padding:
                    "40px 20px",

                  textAlign:
                    "center",

                  fontSize:
                    12,

                  opacity:
                    0.5,
                }}
              >
                {debouncedSearch
                  ? `No encontramos "${debouncedSearch}" en ${platformName || "esta plataforma"}.`
                  : "No hay juegos para mostrar."}
              </div>
            )}

          {/* GRID */}

          {!loading &&
            !error &&
            games.length >
              0 && (
              <div
                style={{
                  display:
                    "grid",

                  gridTemplateColumns:
                    landscape
                      ? "repeat(auto-fill, minmax(95px, 1fr))"
                      : "repeat(auto-fill, minmax(115px, 1fr))",

                  gap:
                    landscape
                      ? 8
                      : 12,
                }}
              >
                {games.map(
                  (game) => (
                    <GameCard
                      key={
                        game.id
                      }
                      game={
                        game
                      }
                      compact={
                        landscape
                      }
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
                  display:
                    "flex",

                  justifyContent:
                    "center",

                  alignItems:
                    "center",

                  gap:
                    10,

                  marginTop:
                    18,

                  paddingBottom:
                    8,
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

                    cursor:
                      page <= 1
                        ? "default"
                        : "pointer",
                  }}
                >
                  ‹
                </button>

                <div
                  style={{
                    minWidth:
                      70,

                    textAlign:
                      "center",

                    fontSize:
                      11,

                    opacity:
                      0.6,
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

                    cursor:
                      hasMore
                        ? "pointer"
                        : "default",
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
  position:
    "fixed",

  inset:
    0,

  zIndex:
    10000,

  display:
    "flex",

  alignItems:
    "center",

  justifyContent:
    "center",

  boxSizing:
    "border-box",

  background:
    "rgba(3,4,7,0.72)",

  backdropFilter:
    "blur(6px)",

  WebkitBackdropFilter:
    "blur(6px)",

  overflow:
    "hidden",
};

const panelStyle = {
  position:
    "relative",

  width:
    "min(920px, 100%)",

  maxWidth:
    "100%",

  overflowY:
    "auto",

  overflowX:
    "hidden",

  WebkitOverflowScrolling:
    "touch",

  overscrollBehavior:
    "contain",

  border:
    "1px solid rgba(255,255,255,0.12)",

  background:
    "#0b0d12",

  boxShadow:
    "0 30px 100px rgba(0,0,0,0.65)",

  color:
    "#ffffff",

  fontFamily:
    "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
};

const closeButtonStyle = {
  position:
    "absolute",

  top:
    10,

  right:
    10,

  zIndex:
    20,

  width:
    38,

  height:
    38,

  padding:
    0,

  border:
    0,

  borderRadius:
    999,

  background:
    "rgba(255,255,255,0.09)",

  color:
    "#ffffff",

  fontSize:
    21,

  lineHeight:
    1,

  cursor:
    "pointer",

  touchAction:
    "manipulation",
};

const paginationButtonStyle = {
  width:
    42,

  height:
    42,

  border:
    "1px solid rgba(255,255,255,0.1)",

  borderRadius:
    11,

  background:
    "rgba(255,255,255,0.06)",

  color:
    "#ffffff",

  fontSize:
    22,

  touchAction:
    "manipulation",
};
