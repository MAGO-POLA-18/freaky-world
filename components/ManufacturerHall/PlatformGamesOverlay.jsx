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
   - orden remoto sobre TODO el catálogo
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
   NOMBRE DEL ORDEN ACTIVO
========================================================= */

function getSortLabel(
  sort,
  direction
) {
  if (
    sort === "score"
  ) {
    return direction ===
      "desc"
      ? "Puntaje ↓"
      : "Puntaje ↑";
  }

  if (
    sort === "year"
  ) {
    return direction ===
      "desc"
      ? "Año ↓"
      : "Año ↑";
  }

  return direction ===
    "desc"
    ? "Z–A"
    : "A–Z";
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
   OPCIÓN FILTRO
========================================================= */

function SortOption({
  label,
  active,
  leftLabel,
  rightLabel,
  direction,
  onSelect,
}) {
  return (
    <div
      style={{
        padding:
          "10px 0",

        borderBottom:
          "1px solid rgba(255,255,255,0.065)",
      }}
    >
      <div
        style={{
          marginBottom:
            7,

          color:
            active
              ? "#ffffff"
              : "#9aa3aa",

          fontSize:
            11,

          fontWeight:
            800,
        }}
      >
        {label}
      </div>

      <div
        style={{
          display:
            "grid",

          gridTemplateColumns:
            "1fr 1fr",

          gap:
            6,
        }}
      >
        <button
          type="button"
          onClick={() =>
            onSelect(
              "asc"
            )
          }
          style={
            sortDirectionButtonStyle(
              active &&
                direction ===
                  "asc"
            )
          }
        >
          {leftLabel}
        </button>

        <button
          type="button"
          onClick={() =>
            onSelect(
              "desc"
            )
          }
          style={
            sortDirectionButtonStyle(
              active &&
                direction ===
                  "desc"
            )
          }
        >
          {rightLabel}
        </button>
      </div>
    </div>
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

  const [
    debouncedSearch,
    setDebouncedSearch,
  ] = useState("");

  /* =======================================================
     ORDEN
  ======================================================= */

  const [
    sort,
    setSort,
  ] = useState(
    "alpha"
  );

  const [
    direction,
    setDirection,
  ] = useState(
    "asc"
  );

  const [
    sortOpen,
    setSortOpen,
  ] = useState(false);

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

    setSort(
      "alpha"
    );

    setDirection(
      "asc"
    );

    setSortOpen(
      false
    );
  }, [
    platformId,
  ]);

  /* =======================================================
     DEBOUNCE BUSCADOR
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
     CAMBIAR ORDEN
  ======================================================= */

  function selectSort(
    nextSort,
    nextDirection
  ) {
    setSort(
      nextSort
    );

    setDirection(
      nextDirection
    );

    setPage(1);

    setSortOpen(false);
  }

  /* =======================================================
     ESC
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

      /*
        Si el panel de orden está abierto,
        primero cerramos eso.
      */

      if (
        sortOpen
      ) {
        event.preventDefault();

        setSortOpen(false);

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
    sortOpen,
  ]);

  /* =======================================================
     FETCH
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

        /*
          NUEVO:

          sort:
          - alpha
          - score
          - year

          direction:
          - asc
          - desc
        */

        params.set(
          "sort",
          sort
        );

        params.set(
          "direction",
          direction
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
    sort,
    direction,
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

  const sortLabel =
    getSortLabel(
      sort,
      direction
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

          {/* ===============================================
              BUSCADOR + FILTRO
          =============================================== */}

          <div
            style={{
              position:
                "relative",

              display:
                "grid",

              gridTemplateColumns:
                "minmax(0,1fr) auto",

              gap:
                8,

              alignItems:
                "center",

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

                minWidth:
                  0,

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

                fontSize:
                  16,
              }}
            />

            {/* BOTÓN FILTROS */}

            <button
              type="button"
              aria-label="Ordenar catálogo"
              onClick={() =>
                setSortOpen(
                  (current) =>
                    !current
                )
              }
              style={{
                height:
                  landscape
                    ? 38
                    : 42,

                minWidth:
                  landscape
                    ? 42
                    : 46,

                padding:
                  landscape
                    ? "0 10px"
                    : "0 12px",

                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "center",

                gap:
                  6,

                border:
                  sortOpen
                    ? "1px solid rgba(255,255,255,.30)"
                    : "1px solid rgba(255,255,255,.11)",

                borderRadius:
                  11,

                background:
                  sortOpen
                    ? "rgba(255,255,255,.13)"
                    : "rgba(255,255,255,.055)",

                color:
                  "#ffffff",

                fontSize:
                  14,

                fontWeight:
                  800,

                cursor:
                  "pointer",

                touchAction:
                  "manipulation",
              }}
            >
              <span
                style={{
                  fontSize:
                    17,
                }}
              >
                ⇅
              </span>

              {!landscape && (
                <span
                  style={{
                    fontSize:
                      10,

                    whiteSpace:
                      "nowrap",
                  }}
                >
                  {sortLabel}
                </span>
              )}
            </button>

            {/* =============================================
                PANEL DE ORDEN
            ============================================= */}

            {sortOpen && (
              <div
                style={{
                  position:
                    "absolute",

                  top:
                    "calc(100% + 7px)",

                  right:
                    0,

                  zIndex:
                    50,

                  width:
                    Math.min(
                      250,
                      viewport.width -
                        40
                    ),

                  padding:
                    "4px 12px 8px",

                  border:
                    "1px solid rgba(255,255,255,.12)",

                  borderRadius:
                    14,

                  background:
                    "rgba(15,18,23,.985)",

                  boxShadow:
                    "0 18px 45px rgba(0,0,0,.55)",

                  backdropFilter:
                    "blur(18px)",

                  WebkitBackdropFilter:
                    "blur(18px)",
                }}
              >
                <div
                  style={{
                    padding:
                      "10px 0 4px",

                    color:
                      "#ffffff",

                    fontSize:
                      12,

                    fontWeight:
                      850,
                  }}
                >
                  Ordenar catálogo
                </div>

                {/* ALFABÉTICO */}

                <SortOption
                  label="Alfabético"
                  active={
                    sort ===
                    "alpha"
                  }
                  direction={
                    direction
                  }
                  leftLabel="A → Z"
                  rightLabel="Z → A"
                  onSelect={(
                    nextDirection
                  ) =>
                    selectSort(
                      "alpha",
                      nextDirection
                    )
                  }
                />

                {/* PUNTAJE */}

                <SortOption
                  label="Puntaje"
                  active={
                    sort ===
                    "score"
                  }
                  direction={
                    direction
                  }
                  leftLabel="Menor"
                  rightLabel="Mayor"
                  onSelect={(
                    nextDirection
                  ) =>
                    selectSort(
                      "score",
                      nextDirection
                    )
                  }
                />

                {/* AÑO */}

                <SortOption
                  label="Año"
                  active={
                    sort ===
                    "year"
                  }
                  direction={
                    direction
                  }
                  leftLabel="Antiguos"
                  rightLabel="Nuevos"
                  onSelect={(
                    nextDirection
                  ) =>
                    selectSort(
                      "year",
                      nextDirection
                    )
                  }
                />
              </div>
            )}
          </div>

          {/* ESTADO */}

          <div
            style={{
              display:
                "flex",

              flexWrap:
                "wrap",

              alignItems:
                "center",

              gap:
                6,

              marginTop:
                7,

              fontSize:
                9,

              color:
                "#7f8a90",
            }}
          >
            {debouncedSearch && (
              <>
                <span>
                  Buscando:
                </span>

                <strong
                  style={{
                    color:
                      "#d5dadd",
                  }}
                >
                  {debouncedSearch}
                </strong>

                <span>
                  ·
                </span>
              </>
            )}

            <span>
              Orden:{" "}
              <strong
                style={{
                  color:
                    "#d5dadd",
                }}
              >
                {sortLabel}
              </strong>
            </span>
          </div>
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

function sortDirectionButtonStyle(
  active
) {
  return {
    minHeight:
      34,

    padding:
      "6px 8px",

    border:
      active
        ? "1px solid rgba(255,255,255,.42)"
        : "1px solid rgba(255,255,255,.08)",

    borderRadius:
      9,

    background:
      active
        ? "#ffffff"
        : "rgba(255,255,255,.045)",

    color:
      active
        ? "#090b10"
        : "#d5dade",

    fontSize:
      10,

    fontWeight:
      800,

    cursor:
      "pointer",

    touchAction:
      "manipulation",
  };
}

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
