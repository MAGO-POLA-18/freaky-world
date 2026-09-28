"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

/* =========================================================
   CONFIG
========================================================= */

const SEARCH_DELAY = 320;
const MIN_SEARCH_LENGTH = 2;

/* =========================================================
   HELPERS
========================================================= */

function getCover(game) {
  return (
    game?.cover?.medium ||
    game?.cover?.small ||
    game?.cover?.large ||
    null
  );
}

function getScore(game) {
  const freaky =
    Number(
      game?.freakyOfficialScore
    );

  if (
    Number.isFinite(freaky) &&
    freaky > 0
  ) {
    return freaky > 10
      ? freaky / 10
      : freaky;
  }

  const total =
    Number(
      game?.totalRating
    );

  if (
    Number.isFinite(total) &&
    total > 0
  ) {
    return total / 10;
  }

  const rating =
    Number(
      game?.rating
    );

  if (
    Number.isFinite(rating) &&
    rating > 0
  ) {
    return rating / 10;
  }

  return null;
}

function formatScore(value) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(
      Number(value)
    )
  ) {
    return null;
  }

  return Number(value)
    .toFixed(1);
}

/* =========================================================
   RESULTADO
========================================================= */

function SearchResult({
  game,
  onSelect,
}) {
  const cover =
    getCover(game);

  const score =
    getScore(game);

  return (
    <button
      type="button"
      onClick={() =>
        onSelect(game)
      }
      style={{
        width:
          "100%",

        minHeight:
          86,

        display:
          "grid",

        gridTemplateColumns:
          "58px minmax(0,1fr) auto",

        alignItems:
          "center",

        gap:
          12,

        padding:
          10,

        border:
          "1px solid rgba(255,255,255,.08)",

        borderRadius:
          14,

        background:
          "rgba(17,21,26,.92)",

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
          width:
            58,

          height:
            70,

          overflow:
            "hidden",

          borderRadius:
            9,

          background:
            "#090c0f",

          border:
            "1px solid rgba(255,255,255,.08)",
        }}
      >
        {cover ? (
          <img
            src={cover}
            alt=""
            loading="lazy"
            style={{
              width:
                "100%",

              height:
                "100%",

              objectFit:
                "cover",

              display:
                "block",
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
                "grid",

              placeItems:
                "center",

              color:
                "#667078",

              fontSize:
                18,

              fontWeight:
                900,
            }}
          >
            ?
          </div>
        )}
      </div>

      {/* DATOS */}

      <div
        style={{
          minWidth:
            0,
        }}
      >
        <div
          style={{
            overflow:
              "hidden",

            color:
              "#f6f8f9",

            fontSize:
              14,

            lineHeight:
              1.25,

            fontWeight:
              850,

            textOverflow:
              "ellipsis",

            whiteSpace:
              "nowrap",
          }}
        >
          {game.name}
        </div>

        <div
          style={{
            display:
              "flex",

            flexWrap:
              "wrap",

            gap:
              "4px 8px",

            marginTop:
              6,

            color:
              "#8d989f",

            fontSize:
              11,

            lineHeight:
              1.35,
          }}
        >
          {game.year && (
            <span>
              {game.year}
            </span>
          )}

          {game.developer && (
            <span>
              {game.developer}
            </span>
          )}
        </div>

        <div
          style={{
            marginTop:
              5,

            color:
              "#606a71",

            fontSize:
              9,

            fontWeight:
              700,
          }}
        >
          ID {game.id}
        </div>
      </div>

      {/* PUNTUACIÓN */}

      <div
        style={{
          minWidth:
            42,

          textAlign:
            "center",
        }}
      >
        {score !== null ? (
          <>
            <div
              style={{
                color:
                  "#ffffff",

                fontSize:
                  17,

                lineHeight:
                  1,

                fontWeight:
                  950,
              }}
            >
              {formatScore(
                score
              )}
            </div>

            <div
              style={{
                marginTop:
                  3,

                color:
                  "#68737a",

                fontSize:
                  8,

                fontWeight:
                  800,
              }}
            >
              / 10
            </div>
          </>
        ) : (
          <span
            style={{
              color:
                "#59636a",

              fontSize:
                15,
            }}
          >
            —
          </span>
        )}
      </div>
    </button>
  );
}

/* =========================================================
   BUSCADOR
========================================================= */

export default function GameSearchOverlay({
  open,
  onClose,
  onSelectGame,
}) {
  const [
    query,
    setQuery,
  ] = useState("");

  const [
    games,
    setGames,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState(null);

  const inputRef =
    useRef(null);

  const requestRef =
    useRef(null);

  /* =======================================================
     ABRIR / CERRAR
  ======================================================= */

  useEffect(() => {
    if (!open) {
      requestRef.current
        ?.abort();

      setQuery("");
      setGames([]);
      setLoading(false);
      setError(null);

      return;
    }

    const timer =
      window.setTimeout(
        () => {
          inputRef.current
            ?.focus();
        },
        80
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [open]);

  /* =======================================================
     BLOQUEAR SCROLL
  ======================================================= */

  useEffect(() => {
    if (!open) {
      return;
    }

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
  }, [open]);

  /* =======================================================
     ESCAPE
  ======================================================= */

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (
      event
    ) => {
      if (
        event.code ===
        "Escape"
      ) {
        event.preventDefault();
        event.stopPropagation();

        onClose?.();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
      true
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
        true
      );
    };
  }, [
    open,
    onClose,
  ]);

  /* =======================================================
     BÚSQUEDA

     - Espera 320 ms.
     - Cancela consulta anterior.
     - Nunca descarga biblioteca completa.
     - Máximo 20 resultados desde API.
  ======================================================= */

  useEffect(() => {
    if (!open) {
      return;
    }

    const normalized =
      query.trim();

    if (
      normalized.length <
      MIN_SEARCH_LENGTH
    ) {
      requestRef.current
        ?.abort();

      setGames([]);
      setLoading(false);
      setError(null);

      return;
    }

    const timer =
      window.setTimeout(
        async () => {
          requestRef.current
            ?.abort();

          const controller =
            new AbortController();

          requestRef.current =
            controller;

          setLoading(true);
          setError(null);

          try {
            const response =
              await fetch(
                `/api/games?search=${encodeURIComponent(
                  normalized
                )}&limit=20`,
                {
                  method:
                    "GET",

                  signal:
                    controller.signal,

                  cache:
                    "no-store",
                }
              );

            const data =
              await response.json();

            if (
              !response.ok ||
              !data?.ok
            ) {
              throw new Error(
                data?.error ||
                  "No se pudo realizar la búsqueda."
              );
            }

            if (
              controller.signal
                .aborted
            ) {
              return;
            }

            setGames(
              Array.isArray(
                data.games
              )
                ? data.games
                : []
            );
          } catch (searchError) {
            if (
              searchError?.name ===
              "AbortError"
            ) {
              return;
            }

            setGames([]);

            setError(
              searchError instanceof
                Error
                ? searchError.message
                : "Error buscando juegos."
            );
          } finally {
            if (
              !controller.signal
                .aborted
            ) {
              setLoading(false);
            }
          }
        },
        SEARCH_DELAY
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [
    query,
    open,
  ]);

  /* =======================================================
     SELECCIONAR
  ======================================================= */

  function selectGame(game) {
    if (!game?.id) {
      return;
    }

    requestRef.current
      ?.abort();

    onSelectGame?.(
      game
    );
  }

  if (!open) {
    return null;
  }

  const normalizedQuery =
    query.trim();

  const waitingForQuery =
    normalizedQuery.length <
    MIN_SEARCH_LENGTH;

  const noResults =
    !loading &&
    !error &&
    !waitingForQuery &&
    games.length === 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Buscar juegos"
      onMouseDown={(
        event
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose?.();
        }
      }}
      style={{
        position:
          "fixed",

        inset:
          0,

        zIndex:
          140,

        display:
          "flex",

        justifyContent:
          "center",

        alignItems:
          "flex-start",

        padding:
          "max(68px, env(safe-area-inset-top)) 12px max(18px, env(safe-area-inset-bottom))",

        overflowY:
          "auto",

        background:
          "rgba(0,0,0,.68)",

        backdropFilter:
          "blur(10px)",
      }}
    >
      <div
        style={{
          width:
            "min(100%,620px)",

          overflow:
            "hidden",

          border:
            "1px solid rgba(255,255,255,.12)",

          borderRadius:
            20,

          background:
            "rgba(8,11,14,.97)",

          boxShadow:
            "0 28px 90px rgba(0,0,0,.5)",
        }}
      >
        {/* =================================================
            CABECERA
        ================================================= */}

        <div
          style={{
            display:
              "flex",

            alignItems:
              "center",

            justifyContent:
              "space-between",

            gap:
              12,

            padding:
              "15px 16px 12px",

            borderBottom:
              "1px solid rgba(255,255,255,.07)",
          }}
        >
          <div>
            <div
              style={{
                color:
                  "#ffffff",

                fontSize:
                  15,

                fontWeight:
                  900,
              }}
            >
              Buscar juego
            </div>

            <div
              style={{
                marginTop:
                  3,

                color:
                  "#68737a",

                fontSize:
                  10,

                fontWeight:
                  700,
              }}
            >
              Biblioteca Tierra Vicio
            </div>
          </div>

          <button
            type="button"
            aria-label="Cerrar búsqueda"
            onClick={
              onClose
            }
            style={{
              width:
                38,

              height:
                38,

              flex:
                "0 0 auto",

              display:
                "grid",

              placeItems:
                "center",

              border:
                "1px solid rgba(255,255,255,.1)",

              borderRadius:
                "50%",

              background:
                "rgba(255,255,255,.06)",

              color:
                "#ffffff",

              fontSize:
                23,

              lineHeight:
                1,

              cursor:
                "pointer",
            }}
          >
            ×
          </button>
        </div>

        {/* =================================================
            INPUT
        ================================================= */}

        <div
          style={{
            padding:
              "14px 16px",
          }}
        >
          <div
            style={{
              position:
                "relative",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                position:
                  "absolute",

                top:
                  "50%",

                left:
                  14,

                transform:
                  "translateY(-50%)",

                color:
                  "#7c878e",

                fontSize:
                  18,

                pointerEvents:
                  "none",
              }}
            >
              ⌕
            </span>

            <input
              ref={
                inputRef
              }
              type="search"
              value={
                query
              }
              onChange={(
                event
              ) =>
                setQuery(
                  event.target
                    .value
                )
              }
              placeholder="Mafia, Resident Evil, Zelda..."
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              enterKeyHint="search"
              style={{
                width:
                  "100%",

                height:
                  48,

                boxSizing:
                  "border-box",

                padding:
                  "0 42px 0 43px",

                border:
                  "1px solid rgba(255,255,255,.12)",

                borderRadius:
                  14,

                outline:
                  "none",

                background:
                  "#11161b",

                color:
                  "#ffffff",

                fontSize:
                  16,

                fontWeight:
                  650,
              }}
            />

            {query && (
              <button
                type="button"
                aria-label="Borrar búsqueda"
                onClick={() =>
                  setQuery("")
                }
                style={{
                  position:
                    "absolute",

                  top:
                    "50%",

                  right:
                    7,

                  transform:
                    "translateY(-50%)",

                  width:
                    34,

                  height:
                    34,

                  display:
                    "grid",

                  placeItems:
                    "center",

                  border:
                    0,

                  borderRadius:
                    "50%",

                  background:
                    "transparent",

                  color:
                    "#879198",

                  fontSize:
                    18,

                  cursor:
                    "pointer",
                }}
              >
                ×
              </button>
            )}
          </div>

          {/* =================================================
              ESTADOS
          ================================================= */}

          <div
            aria-live="polite"
            style={{
              minHeight:
                32,

              display:
                "flex",

              alignItems:
                "center",

              padding:
                "8px 2px 0",

              color:
                error
                  ? "#ff8585"
                  : "#6e7980",

              fontSize:
                10,

              fontWeight:
                700,
            }}
          >
            {waitingForQuery
              ? "Escribí al menos 2 caracteres."
              : loading
                ? "Buscando..."
                : error
                  ? error
                  : noResults
                    ? "No encontramos juegos con ese nombre."
                    : games.length
                      ? `${games.length} resultado${
                          games.length ===
                          1
                            ? ""
                            : "s"
                        }`
                      : ""}
          </div>

          {/* =================================================
              RESULTADOS
          ================================================= */}

          {games.length >
            0 && (
            <div
              style={{
                display:
                  "grid",

                gap:
                  8,

                marginTop:
                  4,

                paddingBottom:
                  4,
              }}
            >
              {games.map(
                (game) => (
                  <SearchResult
                    key={
                      game.id
                    }
                    game={
                      game
                    }
                    onSelect={
                      selectGame
                    }
                  />
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
