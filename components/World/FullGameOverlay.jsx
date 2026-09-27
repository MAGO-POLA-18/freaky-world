"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

/* =========================================================
   HELPERS
========================================================= */

function asArray(value) {
  return Array.isArray(value)
    ? value
    : [];
}

function getTitle(game) {
  return (
    game?.title ||
    game?.name ||
    "Juego"
  );
}

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

function getYear(game) {
  return (
    game?.year ||
    game?.releaseYear ||
    (
      game?.releaseDate
        ? new Date(
            game.releaseDate
          ).getFullYear()
        : null
    )
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
    return {
      value:
        freaky > 10
          ? freaky / 10
          : freaky,

      votes:
        Number(
          game?.freakyOfficialVotes
        ) || 0,
    };
  }

  const igdb =
    typeof game?.totalRating ===
    "number"
      ? game.totalRating
      : typeof game?.rating ===
          "number"
        ? game.rating
        : null;

  return {
    value:
      igdb !== null
        ? igdb / 10
        : null,

    votes:
      game?.totalRatingCount ||
      game?.ratingCount ||
      0,
  };
}

function getCommunityScore(game) {
  const value =
    Number(
      game?.communityScore
    );

  return {
    value:
      Number.isFinite(value) &&
      value > 0
        ? value > 10
          ? value / 10
          : value
        : null,

    votes:
      Number(
        game?.communityVotes
      ) || 0,
  };
}

function getYoutubeId(video) {
  return (
    video?.youtubeId ||
    video?.youtube_id ||
    null
  );
}

function chooseFirstVideo(game) {
  const manual =
    game?.manualTrailer?.youtubeId ||
    game?.manualTrailerYoutubeId;

  if (manual) {
    return manual;
  }

  const videos =
    asArray(game?.videos);

  const preferences = [
    "launch trailer",
    "official trailer",
    "release trailer",
    "gameplay trailer",
    "trailer",
  ];

  for (
    const preference of preferences
  ) {
    const found =
      videos.find(
        (video) =>
          String(
            video?.name || ""
          )
            .toLowerCase()
            .includes(
              preference
            )
      );

    const id =
      getYoutubeId(found);

    if (id) {
      return id;
    }
  }

  return getYoutubeId(
    videos[0]
  );
}

function normalizeNamedItems(
  items
) {
  return asArray(items)
    .map(
      (item) =>
        typeof item === "string"
          ? item
          : item?.name ||
            item?.title ||
            item?.abbreviation
    )
    .filter(Boolean);
}

function unique(items) {
  return [
    ...new Set(
      items.filter(Boolean)
    ),
  ];
}

function formatScore(value) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(
      Number(value)
    )
  ) {
    return "—";
  }

  return Number(value)
    .toFixed(1);
}

function useMediaQuery(query) {
  const [
    matches,
    setMatches,
  ] = useState(false);

  useEffect(() => {
    const media =
      window.matchMedia(query);

    const update = () =>
      setMatches(
        media.matches
      );

    update();

    media.addEventListener?.(
      "change",
      update
    );

    return () =>
      media.removeEventListener?.(
        "change",
        update
      );
  }, [query]);

  return matches;
}

/* =========================================================
   UI BASE
========================================================= */

function Section({
  title,
  children,
  style,
}) {
  return (
    <section
      style={{
        padding: 18,

        border:
          "1px solid rgba(255,255,255,.09)",

        borderRadius: 18,

        background:
          "rgba(17,21,26,.94)",

        boxShadow:
          "0 18px 50px rgba(0,0,0,.18)",

        ...style,
      }}
    >
      {title && (
        <h2
          style={{
            margin:
              "0 0 14px",

            color:
              "#f5f7f8",

            fontSize: 15,

            lineHeight: 1.2,

            fontWeight: 850,

            letterSpacing:
              ".015em",
          }}
        >
          {title}
        </h2>
      )}

      {children}
    </section>
  );
}

function Chip({
  children,
  accent =
    "#5fdcff",
}) {
  return (
    <span
      style={{
        display:
          "inline-flex",

        alignItems:
          "center",

        minHeight: 28,

        padding:
          "5px 10px",

        border:
          `1px solid ${accent}42`,

        borderRadius: 999,

        background:
          `${accent}12`,

        color:
          "#dce4e8",

        fontSize: 11,

        fontWeight: 700,

        lineHeight: 1.25,
      }}
    >
      {children}
    </span>
  );
}

function ScoreBox({
  label,
  value,
  sublabel,
  accent,
}) {
  return (
    <div
      style={{
        minWidth: 0,

        padding:
          "13px 10px",

        border:
          "1px solid rgba(255,255,255,.09)",

        borderRadius: 15,

        background:
          "#0d1115",

        textAlign:
          "center",
      }}
    >
      <div
        style={{
          color:
            "#8e999f",

          fontSize: 10,

          fontWeight: 800,

          textTransform:
            "uppercase",

          letterSpacing:
            ".08em",
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: 6,

          color:
            accent ||
            "#ffffff",

          fontSize: 26,

          lineHeight: 1,

          fontWeight: 950,
        }}
      >
        {value}
      </div>

      {sublabel && (
        <div
          style={{
            marginTop: 5,

            color:
              "#6f7a81",

            fontSize: 9,

            fontWeight: 700,
          }}
        >
          {sublabel}
        </div>
      )}
    </div>
  );
}

function DataRow({
  label,
  value,
}) {
  if (!value) {
    return null;
  }

  return (
    <div
      style={{
        display: "grid",

        gridTemplateColumns:
          "105px minmax(0,1fr)",

        gap: 12,

        padding:
          "8px 0",

        borderBottom:
          "1px solid rgba(255,255,255,.055)",
      }}
    >
      <div
        style={{
          color:
            "#778188",

          fontSize: 11,

          fontWeight: 750,
        }}
      >
        {label}
      </div>

      <div
        style={{
          minWidth: 0,

          color:
            "#d8dde0",

          fontSize: 12,

          lineHeight: 1.45,

          fontWeight: 650,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function navButtonStyle() {
  return {
    width: 34,
    height: 34,

    display: "grid",

    placeItems:
      "center",

    border:
      "1px solid rgba(255,255,255,.12)",

    borderRadius:
      "50%",

    background:
      "#181d22",

    color:
      "#ffffff",

    fontSize: 24,

    lineHeight: 1,

    cursor:
      "pointer",
  };
}

/* =========================================================
   VIDEO
========================================================= */

function VideoPlayer({
  game,
}) {
  const videos =
    useMemo(() => {
      const ids =
        asArray(game?.videos)
          .map(
            getYoutubeId
          )
          .filter(Boolean);

      const preferred =
        chooseFirstVideo(game);

      return unique([
        preferred,
        ...ids,
      ]);
    }, [game]);

  const [
    activeIndex,
    setActiveIndex,
  ] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [game?.id]);

  if (!videos.length) {
    return null;
  }

  const videoId =
    videos[
      Math.min(
        activeIndex,
        videos.length - 1
      )
    ];

  return (
    <div>
      <div
        style={{
          position:
            "relative",

          width: "100%",

          aspectRatio:
            "16 / 9",

          overflow:
            "hidden",

          border:
            "1px solid rgba(255,255,255,.1)",

          borderRadius: 17,

          background:
            "#000",
        }}
      >
        <iframe
          key={videoId}
          src={
            `https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0`
          }
          title={
            `${getTitle(game)} — vídeo`
          }
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{
            position:
              "absolute",

            inset: 0,

            width: "100%",

            height: "100%",

            border: 0,
          }}
        />
      </div>

      {videos.length > 1 && (
        <div
          style={{
            display:
              "flex",

            alignItems:
              "center",

            justifyContent:
              "center",

            gap: 10,

            marginTop: 9,
          }}
        >
          <button
            type="button"
            onClick={() =>
              setActiveIndex(
                (current) =>
                  (
                    current -
                    1 +
                    videos.length
                  ) %
                  videos.length
              )
            }
            style={
              navButtonStyle()
            }
          >
            ‹
          </button>

          <span
            style={{
              color:
                "#8e999f",

              fontSize: 10,

              fontWeight: 800,
            }}
          >
            {activeIndex + 1}
            {" de "}
            {videos.length}
          </span>

          <button
            type="button"
            onClick={() =>
              setActiveIndex(
                (current) =>
                  (
                    current +
                    1
                  ) %
                  videos.length
              )
            }
            style={
              navButtonStyle()
            }
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   GALERÍA
========================================================= */

function Gallery({
  game,
}) {
  const images =
    useMemo(() => {
      const screenshots =
        asArray(
          game?.screenshots
        )
          .map(
            (item) =>
              item?.url ||
              item?.imageUrl
          )
          .filter(Boolean);

      const artworks =
        asArray(
          game?.artworks
        )
          .map(
            (item) =>
              item?.url ||
              item?.imageUrl
          )
          .filter(Boolean);

      return unique([
        ...screenshots,
        ...artworks,
      ]);
    }, [game]);

  const [
    selected,
    setSelected,
  ] = useState(null);

  useEffect(() => {
    setSelected(null);
  }, [game?.id]);

  if (!images.length) {
    return null;
  }

  return (
    <>
      <Section title="Galería">
        <div
          style={{
            display: "grid",

            gridTemplateColumns:
              "repeat(auto-fill,minmax(150px,1fr))",

            gap: 9,
          }}
        >
          {images
            .slice(0, 12)
            .map(
              (
                image,
                index
              ) => (
                <button
                  key={
                    `${image}-${index}`
                  }
                  type="button"
                  onClick={() =>
                    setSelected(
                      index
                    )
                  }
                  style={{
                    position:
                      "relative",

                    padding: 0,

                    width:
                      "100%",

                    aspectRatio:
                      "16 / 9",

                    overflow:
                      "hidden",

                    border:
                      "1px solid rgba(255,255,255,.08)",

                    borderRadius:
                      11,

                    background:
                      "#090b0e",

                    cursor:
                      "pointer",
                  }}
                >
                  <img
                    src={image}
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
                </button>
              )
            )}
        </div>
      </Section>

      {selected !== null && (
        <div
          role="presentation"
          onClick={() =>
            setSelected(null)
          }
          style={{
            position:
              "fixed",

            inset: 0,

            zIndex:
              100002,

            display:
              "grid",

            placeItems:
              "center",

            padding: 18,

            background:
              "rgba(0,0,0,.92)",
          }}
        >
          <button
            type="button"
            aria-label="Cerrar galería"
            onClick={() =>
              setSelected(null)
            }
            style={{
              position:
                "absolute",

              top: 16,

              right: 16,

              ...navButtonStyle(),
            }}
          >
            ×
          </button>

          <button
            type="button"
            aria-label="Imagen anterior"
            onClick={(
              event
            ) => {
              event.stopPropagation();

              setSelected(
                (
                  selected -
                  1 +
                  images.length
                ) %
                  images.length
              );
            }}
            style={{
              position:
                "absolute",

              left: 16,

              top: "50%",

              transform:
                "translateY(-50%)",

              ...navButtonStyle(),
            }}
          >
            ‹
          </button>

          <img
            src={
              images[selected]
            }
            alt=""
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
            style={{
              maxWidth:
                "min(1200px,92vw)",

              maxHeight:
                "86vh",

              objectFit:
                "contain",

              borderRadius:
                14,
            }}
          />

          <button
            type="button"
            aria-label="Imagen siguiente"
            onClick={(
              event
            ) => {
              event.stopPropagation();

              setSelected(
                (
                  selected +
                  1
                ) %
                  images.length
              );
            }}
            style={{
              position:
                "absolute",

              right: 16,

              top: "50%",

              transform:
                "translateY(-50%)",

              ...navButtonStyle(),
            }}
          >
            ›
          </button>

          <div
            style={{
              position:
                "absolute",

              bottom: 16,

              padding:
                "6px 11px",

              borderRadius:
                999,

              background:
                "rgba(0,0,0,.7)",

              color:
                "#ffffff",

              fontSize: 11,

              fontWeight: 800,
            }}
          >
            {selected + 1}
            {" de "}
            {images.length}
          </div>
        </div>
      )}
    </>
  );
}

/* =========================================================
   IDIOMAS
========================================================= */

function Languages({
  game,
}) {
  const languages =
    asArray(
      game?.languages
    );

  if (!languages.length) {
    return null;
  }

  return (
    <Section title="Idiomas">
      <div
        style={{
          overflowX:
            "auto",
        }}
      >
        <table
          style={{
            width: "100%",

            borderCollapse:
              "collapse",

            minWidth: 420,
          }}
        >
          <thead>
            <tr>
              {[
                "Idioma",
                "Audio",
                "Sub.",
                "Interfaz",
              ].map(
                (label) => (
                  <th
                    key={label}
                    style={{
                      padding:
                        "7px 8px",

                      color:
                        "#778188",

                      fontSize:
                        9,

                      fontWeight:
                        850,

                      textAlign:
                        label ===
                        "Idioma"
                          ? "left"
                          : "center",

                      textTransform:
                        "uppercase",

                      letterSpacing:
                        ".07em",

                      borderBottom:
                        "1px solid rgba(255,255,255,.08)",
                    }}
                  >
                    {label}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {languages.map(
              (
                language,
                index
              ) => (
                <tr
                  key={
                    language.id ||
                    language.languageId ||
                    `${language.name}-${index}`
                  }
                >
                  <td
                    style={
                      languageCellStyle(
                        "left"
                      )
                    }
                  >
                    {language.name ||
                      language.languageName ||
                      language.nativeName ||
                      "—"}
                  </td>

                  <td
                    style={
                      languageCellStyle()
                    }
                  >
                    {language.audio
                      ? "✓"
                      : "—"}
                  </td>

                  <td
                    style={
                      languageCellStyle()
                    }
                  >
                    {language.subtitles
                      ? "✓"
                      : "—"}
                  </td>

                  <td
                    style={
                      languageCellStyle()
                    }
                  >
                    {language.interface
                      ? "✓"
                      : "—"}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

function languageCellStyle(
  textAlign = "center"
) {
  return {
    padding:
      "8px",

    borderBottom:
      "1px solid rgba(255,255,255,.045)",

    color:
      "#c9d0d4",

    fontSize: 11,

    fontWeight: 650,

    textAlign,
  };
}

/* =========================================================
   CLASIFICACIÓN
========================================================= */

function AgeRatings({
  game,
  accent,
}) {
  const ratings =
    asArray(
      game?.ageRatings
    );

  if (!ratings.length) {
    return null;
  }

  return (
    <Section title="Clasificación por edades">
      <div
        style={{
          display: "grid",

          gridTemplateColumns:
            "repeat(auto-fit,minmax(120px,1fr))",

          gap: 9,
        }}
      >
        {ratings.map(
          (
            rating,
            index
          ) => (
            <div
              key={
                `${rating.organization}-${rating.rating}-${index}`
              }
              style={{
                padding: 11,

                border:
                  `1px solid ${accent}2d`,

                borderRadius:
                  12,

                background:
                  "#0d1115",
              }}
            >
              <div
                style={{
                  color:
                    "#7e8990",

                  fontSize: 9,

                  fontWeight:
                    850,

                  letterSpacing:
                    ".08em",
                }}
              >
                {rating.organization ||
                  "CLASIFICACIÓN"}
              </div>

              <div
                style={{
                  marginTop: 4,

                  color:
                    "#ffffff",

                  fontSize: 20,

                  fontWeight:
                    950,
                }}
              >
                {rating.rating ||
                  "—"}
              </div>

              {asArray(
                rating.descriptors ||
                rating.contentDescriptors
              ).length >
                0 && (
                <div
                  style={{
                    marginTop:
                      7,

                    color:
                      "#8e999f",

                    fontSize:
                      9,

                    lineHeight:
                      1.4,
                  }}
                >
                  {asArray(
                    rating.descriptors ||
                    rating.contentDescriptors
                  ).join(
                    " · "
                  )}
                </div>
              )}

              {rating.synopsis &&
                rating.synopsis !==
                  "No Rating Summary" && (
                  <div
                    style={{
                      marginTop: 8,

                      color:
                        "#78838a",

                      fontSize: 9,

                      lineHeight: 1.45,
                    }}
                  >
                    {rating.synopsis}
                  </div>
                )}
            </div>
          )
        )}
      </div>
    </Section>
  );
}

/* =========================================================
   JUEGOS SIMILARES
========================================================= */

function SimilarGames({
  game,
  accent,
  onOpenGame,
}) {
  const similarGames =
    asArray(
      game?.similarGames
    );

  const availableGames =
    similarGames.filter(
      (item) =>
        item?.available &&
        item?.id &&
        item?.name
    );

  if (!availableGames.length) {
    return null;
  }

  return (
    <Section title="Juegos similares">
      <div
        style={{
          display: "flex",

          gap: 12,

          overflowX: "auto",

          paddingBottom: 5,

          WebkitOverflowScrolling:
            "touch",

          scrollSnapType:
            "x proximity",
        }}
      >
        {availableGames.map(
          (similar) => {
            const cover =
              getCover(similar);

            return (
              <button
                key={similar.id}
                type="button"
                onClick={() =>
                  onOpenGame?.(
                    similar
                  )
                }
                style={{
                  flex:
                    "0 0 145px",

                  width: 145,

                  padding: 0,

                  overflow:
                    "hidden",

                  border:
                    "1px solid rgba(255,255,255,.09)",

                  borderRadius: 14,

                  background:
                    "#0d1115",

                  color:
                    "#ffffff",

                  textAlign:
                    "left",

                  cursor:
                    "pointer",

                  scrollSnapAlign:
                    "start",
                }}
              >
                <div
                  style={{
                    width: "100%",

                    aspectRatio:
                      "3 / 4",

                    overflow:
                      "hidden",

                    background:
                      "#080a0d",
                  }}
                >
                  {cover ? (
                    <img
                      src={cover}
                      alt={
                        similar.name
                      }
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
                          10,
                      }}
                    >
                      SIN PORTADA
                    </div>
                  )}
                </div>

                <div
                  style={{
                    padding:
                      "10px 10px 11px",
                  }}
                >
                  <div
                    style={{
                      minHeight: 34,

                      color:
                        "#f4f6f7",

                      fontSize: 12,

                      lineHeight:
                        1.35,

                      fontWeight: 850,
                    }}
                  >
                    {similar.name}
                  </div>

                  <div
                    style={{
                      marginTop: 5,

                      color:
                        accent,

                      fontSize: 10,

                      fontWeight: 750,
                    }}
                  >
                    {similar.year ||
                      "Ver ficha"}
                  </div>
                </div>
              </button>
            );
          }
        )}
      </div>
    </Section>
  );
}

/* =========================================================
   ESTADO DE CARGA
========================================================= */

function LoadingBar({
  accent,
}) {
  return (
    <div
      style={{
        position: "relative",

        width: "100%",

        height: 3,

        overflow:
          "hidden",

        background:
          "rgba(255,255,255,.05)",
      }}
    >
      <div
        style={{
          width: "42%",

          height: "100%",

          background:
            accent,

          opacity: 0.85,
        }}
      />
    </div>
  );
}

/* =========================================================
   OVERLAY COMPLETO
========================================================= */

export default function FullGameOverlay({
  game,
  onClose,
  onBack,
}) {
  const mobile =
    useMediaQuery(
      "(max-width: 767px)"
    );

  /*
    game = objeto recibido desde la ficha rápida.

    activeGame = juego que queremos mostrar.
    masterGame = ficha completa recibida de /api/games?id=...
  */

  const [
    activeGame,
    setActiveGame,
  ] = useState(game);

  const [
    masterGame,
    setMasterGame,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    loadError,
    setLoadError,
  ] = useState(null);

  /*
    Historial interno.

    Sirve para:
    Mafia II → GTA V → volver → Mafia II

    sin cerrar la ficha completa.
  */

  const [
    gameHistory,
    setGameHistory,
  ] = useState([]);

  /*
    Si desde WorldScene se abre un juego completamente
    diferente, reiniciamos el estado interno.
  */

  useEffect(() => {
    setActiveGame(game);
    setMasterGame(null);
    setLoadError(null);
    setGameHistory([]);
  }, [game?.id]);

  /*
    Cargar ficha maestra.

    Mientras llega mantenemos visible el objeto que ya
    teníamos, por lo que el usuario no ve una pantalla vacía.
  */

  useEffect(() => {
    const gameId =
      activeGame?.id;

    if (!gameId) {
      return;
    }

    const controller =
      new AbortController();

    let alive = true;

    async function loadGame() {
      setLoading(true);
      setLoadError(null);

      try {
        const response =
          await fetch(
            `/api/games?id=${encodeURIComponent(
              gameId
            )}`,
            {
              method: "GET",

              cache:
                "no-store",

              signal:
                controller.signal,
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              `No se pudo cargar el juego ${gameId}.`
          );
        }

        if (
          !data?.ok ||
          !data?.game
        ) {
          throw new Error(
            "La biblioteca devolvió una ficha inválida."
          );
        }

        if (!alive) {
          return;
        }

        setMasterGame(
          data.game
        );
      } catch (error) {
        if (
          error?.name ===
          "AbortError"
        ) {
          return;
        }

        if (!alive) {
          return;
        }

        console.error(
          "[Freaky World / FullGameOverlay]",
          error
        );

        setLoadError(
          error instanceof Error
            ? error.message
            : "No se pudo cargar la ficha completa."
        );
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    loadGame();

    return () => {
      alive = false;
      controller.abort();
    };
  }, [activeGame?.id]);

  /*
    Una vez cargada la API usamos la ficha maestra.

    Mientras carga, seguimos usando activeGame.
  */

  const displayGame =
    masterGame &&
    Number(masterGame.id) ===
      Number(activeGame?.id)
      ? masterGame
      : activeGame;

  const title =
    getTitle(displayGame);

  const cover =
    getCover(displayGame);

  const year =
    getYear(displayGame);

  const official =
    getScore(displayGame);

  const community =
    getCommunityScore(
      displayGame
    );

  /*
    Conservamos el accent del objeto 3D aunque la ficha
    maestra no lo almacene en Supabase.
  */

  const accent =
    activeGame?.accent ||
    game?.accent ||
    "#5fdcff";

  const platforms =
    normalizeNamedItems(
      displayGame?.platforms
    );

  const genres =
    normalizeNamedItems(
      displayGame?.genres
    );

  const themes =
    normalizeNamedItems(
      displayGame?.themes
    );

  const gameModes =
    normalizeNamedItems(
      displayGame?.gameModes
    );

  const perspectives =
    normalizeNamedItems(
      displayGame?.playerPerspectives
    );

  const engines =
    normalizeNamedItems(
      displayGame?.gameEngines
    );

  const alternativeNames =
    asArray(
      displayGame?.alternativeNames
    )
      .map(
        (item) =>
          typeof item ===
          "string"
            ? item
            : item?.name
      )
      .filter(Boolean);

  /*
    /api/games ya prioriza summary_es/storyline_es.

    Cuando todavía no existe traducción, devuelve el
    original de IGDB como fallback.
  */

  const description =
    displayGame?.editorialSummary ||
    displayGame?.summary ||
    null;

  const storyline =
    displayGame?.storyline ||
    null;

  /* =======================================================
     NAVEGACIÓN ENTRE SIMILARES
  ======================================================= */

  function openSimilarGame(
    similar
  ) {
    if (
      !similar?.id ||
      !similar?.available
    ) {
      return;
    }

    setGameHistory(
      (current) => [
        ...current,
        activeGame,
      ]
    );

    setMasterGame(null);

    setActiveGame({
      ...similar,

      accent,
    });

    /*
      El overlay principal tiene su propio scroll.
      Al cambiar de juego volvemos arriba.
    */

    requestAnimationFrame(
      () => {
        window.scrollTo?.(
          0,
          0
        );
      }
    );
  }

  function goToPreviousGame() {
    if (
      gameHistory.length === 0
    ) {
      return;
    }

    const previous =
      gameHistory[
        gameHistory.length - 1
      ];

    setGameHistory(
      (current) =>
        current.slice(
          0,
          -1
        )
    );

    setMasterGame(null);

    setActiveGame(
      previous
    );
  }

  /* =======================================================
     BLOQUEAR SCROLL DEL MUNDO
  ======================================================= */

  useEffect(() => {
    const previous =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previous;
    };
  }, []);

  /* =======================================================
     ESCAPE
  ======================================================= */

  useEffect(() => {
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
        Si estamos dentro de un similar,
        Escape vuelve al juego anterior.

        Si estamos en el juego inicial,
        cierra la ficha.
      */

      if (
        gameHistory.length >
        0
      ) {
        goToPreviousGame();
        return;
      }

      onClose?.();
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
  });

  if (!activeGame?.id) {
    return null;
  }

  const canGoToPreviousGame =
    gameHistory.length > 0;

  return (
    <div
      style={{
        position: "fixed",

        inset: 0,

        zIndex: 100000,

        width: "100%",

        height: "100dvh",

        overflowY: "auto",

        WebkitOverflowScrolling:
          "touch",

        background:
          "#080a0d",

        color: "#ffffff",

        fontFamily:
          "system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      }}
    >
      {/* CABECERA */}

      <header
        style={{
          position:
            "sticky",

          top: 0,

          zIndex: 20,

          minHeight: 62,

          display: "flex",

          alignItems:
            "center",

          gap: 12,

          padding:
            mobile
              ? "9px 12px"
              : "10px 22px",

          borderBottom:
            `1px solid ${accent}44`,

          background:
            "rgba(5,7,9,.94)",

          backdropFilter:
            "blur(18px)",

          WebkitBackdropFilter:
            "blur(18px)",
        }}
      >
        {(canGoToPreviousGame ||
          onBack) && (
          <button
            type="button"
            onClick={
              canGoToPreviousGame
                ? goToPreviousGame
                : onBack
            }
            style={{
              ...navButtonStyle(),

              flex:
                "0 0 auto",
            }}
            aria-label={
              canGoToPreviousGame
                ? "Volver al juego anterior"
                : "Volver a ficha rápida"
            }
          >
            ‹
          </button>
        )}

        <div
          style={{
            minWidth: 0,

            flex: 1,
          }}
        >
          <div
            style={{
              color: accent,

              fontSize: 9,

              fontWeight: 900,

              letterSpacing:
                ".16em",
            }}
          >
            FREAKY WORLD · FICHA COMPLETA
          </div>

          <div
            style={{
              marginTop: 3,

              overflow:
                "hidden",

              textOverflow:
                "ellipsis",

              whiteSpace:
                "nowrap",

              fontSize:
                mobile
                  ? 16
                  : 20,

              fontWeight: 850,
            }}
          >
            {title}
          </div>
        </div>

        {loading && (
          <div
            style={{
              flex:
                "0 0 auto",

              color:
                "#7f8a90",

              fontSize: 9,

              fontWeight: 800,

              letterSpacing:
                ".06em",
            }}
          >
            CARGANDO
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar ficha"
          style={{
            ...navButtonStyle(),

            flex:
              "0 0 auto",

            fontSize: 25,
          }}
        >
          ×
        </button>
      </header>

      {loading && (
        <LoadingBar
          accent={accent}
        />
      )}

      <main
        style={{
          width: "100%",

          maxWidth: 1320,

          margin: "0 auto",

          padding:
            mobile
              ? "14px 12px 60px"
              : "24px 24px 80px",

          boxSizing:
            "border-box",
        }}
      >
        {/* ERROR NO DESTRUCTIVO */}

        {loadError && (
          <div
            style={{
              marginBottom: 14,

              padding:
                "10px 13px",

              border:
                "1px solid rgba(255,120,120,.25)",

              borderRadius: 12,

              background:
                "rgba(120,20,20,.13)",

              color:
                "#d9a1a1",

              fontSize: 11,

              lineHeight: 1.5,
            }}
          >
            No se pudo actualizar la ficha desde la biblioteca.
            {" "}
            {loadError}
          </div>
        )}

        {/* HERO */}

        <div
          style={{
            display: "grid",

            gridTemplateColumns:
              mobile
                ? "1fr"
                : "220px minmax(0,1fr)",

            gap:
              mobile
                ? 14
                : 24,

            alignItems:
              "start",
          }}
        >
          {/* PORTADA */}

          {cover && (
            <div
              style={{
                width:
                  mobile
                    ? 150
                    : "100%",

                margin:
                  mobile
                    ? "0 auto"
                    : 0,

                overflow:
                  "hidden",

                border:
                  "1px solid rgba(255,255,255,.1)",

                borderRadius: 18,

                background:
                  "#101318",

                boxShadow:
                  "0 22px 60px rgba(0,0,0,.34)",
              }}
            >
              <img
                src={cover}
                alt={title}
                style={{
                  width:
                    "100%",

                  aspectRatio:
                    "3 / 4",

                  objectFit:
                    "cover",

                  display:
                    "block",
                }}
              />
            </div>
          )}

          {/* INFO PRINCIPAL */}

          <div
            style={{
              minWidth: 0,
            }}
          >
            <div
              style={{
                color: accent,

                fontSize: 10,

                fontWeight: 900,

                letterSpacing:
                  ".15em",
              }}
            >
              {displayGame?.rank
                ? `TOP 10 · #${displayGame.rank}`
                : displayGame?.releaseType ||
                  "VIDEOJUEGO"}
            </div>

            <h1
              style={{
                margin:
                  "7px 0 5px",

                fontSize:
                  mobile
                    ? "clamp(27px,8vw,42px)"
                    : "clamp(34px,4vw,58px)",

                lineHeight:
                  1.02,

                letterSpacing:
                  "-.04em",

                fontWeight: 900,
              }}
            >
              {title}
            </h1>

            <div
              style={{
                color:
                  "#9aa4aa",

                fontSize: 14,

                lineHeight: 1.45,
              }}
            >
              {[
                year,
                displayGame?.developer,
                displayGame?.publisher,
              ]
                .filter(Boolean)
                .join(" · ")}
            </div>

            {/* SCORES */}

            <div
              style={{
                display:
                  "grid",

                gridTemplateColumns:
                  "repeat(3,minmax(0,1fr))",

                gap:
                  mobile
                    ? 6
                    : 10,

                marginTop: 18,
              }}
            >
              <ScoreBox
                label="Nota oficial"
                value={
                  formatScore(
                    official.value
                  )
                }
                sublabel={
                  official.votes
                    ? `${official.votes} evaluaciones`
                    : "Sin evaluar"
                }
                accent={accent}
              />

              <ScoreBox
                label="Comunidad"
                value={
                  formatScore(
                    community.value
                  )
                }
                sublabel={
                  community.votes
                    ? `${community.votes} votos`
                    : "Sin votos"
                }
              />

              <ScoreBox
                label="Mi evaluación"
                value="—"
                sublabel="Sin valorar"
              />
            </div>

            {/* CHIPS */}

            {(platforms.length >
              0 ||
              genres.length >
                0) && (
              <div
                style={{
                  marginTop:
                    16,

                  display:
                    "grid",

                  gap: 9,
                }}
              >
                {platforms.length >
                  0 && (
                  <div
                    style={{
                      display:
                        "flex",

                      flexWrap:
                        "wrap",

                      gap: 6,
                    }}
                  >
                    {platforms.map(
                      (
                        item
                      ) => (
                        <Chip
                          key={
                            item
                          }
                          accent={
                            accent
                          }
                        >
                          {item}
                        </Chip>
                      )
                    )}
                  </div>
                )}

                {genres.length >
                  0 && (
                  <div
                    style={{
                      display:
                        "flex",

                      flexWrap:
                        "wrap",

                      gap: 6,
                    }}
                  >
                    {genres.map(
                      (
                        item
                      ) => (
                        <Chip
                          key={
                            item
                          }
                          accent="#58d68d"
                        >
                          {item}
                        </Chip>
                      )
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* VIDEO */}

        <div
          style={{
            marginTop: 22,
          }}
        >
          <VideoPlayer
            game={
              displayGame
            }
          />
        </div>

        {/* DESCRIPCIÓN */}

        {(description ||
          storyline) && (
          <div
            style={{
              display: "grid",

              gridTemplateColumns:
                !mobile &&
                description &&
                storyline
                  ? "1fr 1fr"
                  : "1fr",

              gap: 12,

              marginTop: 18,
            }}
          >
            {description && (
              <Section title="Descripción">
                <p
                  style={{
                    margin: 0,

                    whiteSpace:
                      "pre-line",

                    color:
                      "#bdc5ca",

                    fontSize:
                      13,

                    lineHeight:
                      1.7,
                  }}
                >
                  {description}
                </p>
              </Section>
            )}

            {storyline && (
              <Section title="Historia">
                <p
                  style={{
                    margin: 0,

                    whiteSpace:
                      "pre-line",

                    color:
                      "#bdc5ca",

                    fontSize:
                      13,

                    lineHeight:
                      1.7,
                  }}
                >
                  {storyline}
                </p>
              </Section>
            )}
          </div>
        )}

        {/* FICHA TÉCNICA */}

        <div
          style={{
            marginTop: 12,
          }}
        >
          <Section title="Ficha técnica">
            <DataRow
              label="Año"
              value={year}
            />

            <DataRow
              label="Desarrollador"
              value={
                displayGame?.developer
              }
            />

            <DataRow
              label="Distribuidor"
              value={
                displayGame?.publisher
              }
            />

            <DataRow
              label="Saga"
              value={
                typeof displayGame?.collection ===
                "string"
                  ? displayGame.collection
                  : displayGame?.collection?.name ||
                    displayGame?.collectionName
              }
            />

            <DataRow
              label="Franquicia"
              value={
                typeof displayGame?.franchise ===
                "string"
                  ? displayGame.franchise
                  : displayGame?.franchise?.name ||
                    displayGame?.franchiseName
              }
            />

            <DataRow
              label="Tipo"
              value={
                displayGame?.releaseType
              }
            />

            <DataRow
              label="Plataformas"
              value={
                platforms.join(
                  " · "
                )
              }
            />

            <DataRow
              label="Géneros"
              value={
                genres.join(
                  " · "
                )
              }
            />

            <DataRow
              label="Temas"
              value={
                themes.join(
                  " · "
                )
              }
            />

            <DataRow
              label="Modos"
              value={
                gameModes.join(
                  " · "
                )
              }
            />

            <DataRow
              label="Perspectiva"
              value={
                perspectives.join(
                  " · "
                )
              }
            />

            <DataRow
              label="Motor"
              value={
                engines.join(
                  " · "
                )
              }
            />

            <DataRow
              label="Otros títulos"
              value={
                alternativeNames.join(
                  " · "
                )
              }
            />
          </Section>
        </div>

        {/* IDIOMAS + CLASIFICACIÓN */}

        <div
          style={{
            display: "grid",

            gridTemplateColumns:
              mobile
                ? "1fr"
                : "minmax(0,1.15fr) minmax(0,.85fr)",

            gap: 12,

            marginTop: 12,
          }}
        >
          <Languages
            game={
              displayGame
            }
          />

          <AgeRatings
            game={
              displayGame
            }
            accent={accent}
          />
        </div>

        {/* GALERÍA */}

        <div
          style={{
            marginTop: 12,
          }}
        >
          <Gallery
            game={
              displayGame
            }
          />
        </div>

        {/* SIMILARES */}

        <div
          style={{
            marginTop: 12,
          }}
        >
          <SimilarGames
            game={
              displayGame
            }
            accent={accent}
            onOpenGame={
              openSimilarGame
            }
          />
        </div>

        {/* VOLVER */}

        <div
          style={{
            display: "flex",

            justifyContent:
              "center",

            gap: 10,

            flexWrap:
              "wrap",

            marginTop: 22,
          }}
        >
          {canGoToPreviousGame ? (
            <button
              type="button"
              onClick={
                goToPreviousGame
              }
              style={{
                minHeight: 44,

                padding:
                  "10px 18px",

                border:
                  "1px solid rgba(255,255,255,.15)",

                borderRadius:
                  13,

                background:
                  "#181d22",

                color:
                  "#ffffff",

                fontSize: 11,

                fontWeight: 900,

                cursor:
                  "pointer",
              }}
            >
              VOLVER AL JUEGO ANTERIOR
            </button>
          ) : (
            onBack && (
              <button
                type="button"
                onClick={onBack}
                style={{
                  minHeight: 44,

                  padding:
                    "10px 18px",

                  border:
                    "1px solid rgba(255,255,255,.15)",

                  borderRadius:
                    13,

                  background:
                    "#181d22",

                  color:
                    "#ffffff",

                  fontSize: 11,

                  fontWeight: 900,

                  cursor:
                    "pointer",
                }}
              >
                VOLVER A FICHA RÁPIDA
              </button>
            )
          )}

          <button
            type="button"
            onClick={onClose}
            style={{
              minHeight: 44,

              padding:
                "10px 20px",

              border:
                `1px solid ${accent}`,

              borderRadius:
                13,

              background:
                accent,

              color:
                "#050708",

              fontSize: 11,

              fontWeight: 950,

              cursor:
                "pointer",
            }}
          >
            VOLVER AL MUNDO
          </button>
        </div>
      </main>
    </div>
  );
}
