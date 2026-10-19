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

function useMediaQuery(query) {
  const [
    matches,
    setMatches,
  ] = useState(false);

  useEffect(() => {
    const media =
      window.matchMedia(query);

    const update = () => {
      setMatches(
        media.matches
      );
    };

    update();

    media.addEventListener?.(
      "change",
      update
    );

    return () => {
      media.removeEventListener?.(
        "change",
        update
      );
    };
  }, [
    query,
  ]);

  return matches;
}

/* =========================================================
   PORTADA
========================================================= */

function getCover(game) {
  if (
    typeof game?.cover ===
      "string" &&
    game.cover.trim()
  ) {
    return game.cover;
  }

  return (
    game?.cover?.large ||
    game?.cover?.medium ||
    game?.cover?.small ||

    game?.coverLargeUrl ||
    game?.coverMediumUrl ||
    game?.coverSmallUrl ||

    game?.cover_large_url ||
    game?.cover_medium_url ||
    game?.cover_small_url ||

    game?.cover_image ||
    game?.cover_image_url ||
    game?.coverUrl ||

    null
  );
}

/* =========================================================
   VIDEO
========================================================= */

function getYoutubeId(video) {
  if (!video) {
    return null;
  }

  if (
    typeof video ===
    "string"
  ) {
    return video;
  }

  return (
    video?.youtubeId ||
    video?.youtube_id ||
    null
  );
}

function chooseFirstVideo(game) {
  const manual =
    game?.manualTrailer
      ?.youtubeId ||
    game
      ?.manualTrailerYoutubeId ||
    game
      ?.manual_trailer_youtube_id;

  if (manual) {
    return manual;
  }

  const videos =
    asArray(
      game?.videos
    );

  const preferences = [
    "launch trailer",
    "official trailer",
    "release trailer",
    "gameplay trailer",
    "trailer",
  ];

  for (
    const preference
    of preferences
  ) {
    const found =
      videos.find(
        (video) =>
          String(
            video?.name ||
              ""
          )
            .toLowerCase()
            .includes(
              preference
            )
      );

    const id =
      getYoutubeId(
        found
      );

    if (id) {
      return id;
    }
  }

  return getYoutubeId(
    videos[0]
  );
}

/* =========================================================
   DATOS
========================================================= */

function getYear(game) {
  if (game?.year) {
    return game.year;
  }

  if (
    game?.releaseYear
  ) {
    return game.releaseYear;
  }

  if (
    game?.releaseDate
  ) {
    const date =
      new Date(
        game.releaseDate
      );

    if (
      !Number.isNaN(
        date.getTime()
      )
    ) {
      return date.getFullYear();
    }
  }

  return "";
}

function getDeveloper(game) {
  if (
    typeof game?.developer ===
    "string"
  ) {
    return game.developer;
  }

  return (
    game?.developer?.name ||
    game?.publisher?.name ||
    (
      typeof game?.publisher ===
      "string"
        ? game.publisher
        : ""
    ) ||
    ""
  );
}

function getPlatforms(game) {
  return asArray(
    game?.platforms
  )
    .map(
      (platform) =>
        typeof platform ===
        "string"
          ? platform
          : platform
              ?.abbreviation ||
            platform?.name
    )
    .filter(Boolean)
    .join(" · ");
}

function getGenres(game) {
  return asArray(
    game?.genres
  )
    .map(
      (genre) =>
        typeof genre ===
        "string"
          ? genre
          : genre?.name
    )
    .filter(Boolean)
    .join(" · ");
}

/* =========================================================
   DATO TÉCNICO
========================================================= */

function DataItem({
  label,
  value,
  compact = false,
}) {
  if (!value) {
    return null;
  }

  return (
    <div
      style={{
        minWidth: 0,
      }}
    >
      <div
        style={{
          color:
            "#65727a",

          fontSize:
            compact
              ? 7
              : 8,

          lineHeight:
            1.1,

          fontWeight:
            900,

          letterSpacing:
            ".08em",

          textTransform:
            "uppercase",
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop:
            compact
              ? 2
              : 3,

          overflow:
            "hidden",

          color:
            "#e8ecef",

          fontSize:
            compact
              ? 9
              : 11,

          lineHeight:
            1.25,

          fontWeight:
            750,

          textOverflow:
            "ellipsis",

          display:
            "-webkit-box",

          WebkitLineClamp:
            compact
              ? 1
              : 2,

          WebkitBoxOrient:
            "vertical",
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* =========================================================
   BOTÓN PRINCIPAL
========================================================= */

function ActionButton({
  children,
  onClick,
  primary = false,
  accent = "#5fdcff",
  compact = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width:
          "100%",

        minWidth: 0,

        height:
          compact
            ? 42
            : 48,

        display:
          "grid",

        placeItems:
          "center",

        padding:
          compact
            ? "0 12px"
            : "0 16px",

        border:
          primary
            ? `1px solid ${accent}`
            : "1px solid rgba(255,255,255,.18)",

        borderRadius:
          compact
            ? 11
            : 13,

        background:
          primary
            ? accent
            : "#1b2025",

        color:
          primary
            ? "#050708"
            : "#ffffff",

        fontSize:
          compact
            ? 10
            : 12,

        lineHeight: 1,

        fontWeight:
          950,

        letterSpacing:
          ".025em",

        whiteSpace:
          "nowrap",

        cursor:
          "pointer",

        touchAction:
          "manipulation",

        userSelect:
          "none",

        WebkitUserSelect:
          "none",
      }}
    >
      {children}
    </button>
  );
}

/* =========================================================
   PORTADA
========================================================= */

function CoverCard({
  cover,
  title,
  compact,
}) {
  return (
    <div
      style={{
        position:
          "relative",

        width:
          "100%",

        height:
          "100%",

        minHeight: 0,

        overflow:
          "hidden",

        border:
          "1px solid rgba(255,255,255,.12)",

        borderRadius:
          compact
            ? 11
            : 14,

        background:
          "#0b0e11",
      }}
    >
      {cover ? (
        <img
          src={cover}
          alt={`Portada de ${title}`}
          style={{
            width:
              "100%",

            height:
              "100%",

            display:
              "block",

            objectFit:
              "contain",

            background:
              "#080a0d",
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

            padding:
              10,

            color:
              "#5e6970",

            fontSize:
              10,

            textAlign:
              "center",
          }}
        >
          Portada no disponible
        </div>
      )}
    </div>
  );
}

/* =========================================================
   VIDEO
========================================================= */

function Trailer({
  youtubeId,
  cover,
  title,
  compact,
}) {
  return (
    <div
      style={{
        position:
          "relative",

        width:
          "100%",

        height:
          "100%",

        minHeight: 0,

        overflow:
          "hidden",

        border:
          "1px solid rgba(255,255,255,.12)",

        borderRadius:
          compact
            ? 11
            : 14,

        background:
          "#000",
      }}
    >
      {youtubeId ? (
        <iframe
          key={youtubeId}
          src={
            `https://www.youtube.com/embed/${youtubeId}` +
            "?autoplay=1" +
            "&mute=1" +
            "&playsinline=1" +
            "&rel=0" +
            "&controls=1"
          }
          title={
            `Tráiler de ${title}`
          }
          allow="
            accelerometer;
            autoplay;
            clipboard-write;
            encrypted-media;
            gyroscope;
            picture-in-picture;
            web-share
          "
          allowFullScreen
          style={{
            position:
              "absolute",

            inset: 0,

            width:
              "100%",

            height:
              "100%",

            display:
              "block",

            border: 0,
          }}
        />
      ) : cover ? (
        <img
          src={cover}
          alt=""
          style={{
            position:
              "absolute",

            inset: 0,

            width:
              "100%",

            height:
              "100%",

            display:
              "block",

            objectFit:
              "contain",

            background:
              "#000",
          }}
        />
      ) : (
        <div
          style={{
            position:
              "absolute",

            inset: 0,

            display:
              "grid",

            placeItems:
              "center",

            color:
              "#657078",

            fontSize:
              11,

            fontWeight:
              750,
          }}
        >
          Tráiler no disponible
        </div>
      )}
    </div>
  );
}

/* =========================================================
   PREFICHA
========================================================= */

export default function RankingOverlay({
  game,
  onClose,
}) {
  const horizontal =
    useMediaQuery(
      "(orientation: landscape)"
    );

  const desktop =
    useMediaQuery(
      "(min-width: 1100px)"
    );

  const lowHeight =
    useMediaQuery(
      "(max-height: 520px)"
    );

  const compact =
    horizontal ||
    desktop ||
    lowHeight;

  const [
    completeGame,
    setCompleteGame,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(false);

  /* =======================================================
     CARGAR FICHA COMPLETA PARA LA PREFICHA

     El ranking y el buscador pueden mandar
     objetos ligeros.

     Acá recuperamos:
     - portada real
     - vídeo
     - plataformas
     - género
     - desarrollador
     - año
  ======================================================= */

  useEffect(() => {
    if (!game?.id) {
      setCompleteGame(
        null
      );

      return;
    }

    let active =
      true;

    const controller =
      new AbortController();

    async function load() {
      setLoading(
        true
      );

      try {
        const response =
          await fetch(
            `/api/games?id=${encodeURIComponent(
              game.id
            )}`,
            {
              method:
                "GET",

              cache:
                "no-store",

              signal:
                controller.signal,
            }
          );

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}`
          );
        }

        const data =
          await response.json();

        if (
          !active
        ) {
          return;
        }

        if (
          data?.game
        ) {
          setCompleteGame(
            data.game
          );
        }
      } catch (error) {
        if (
          error?.name !==
          "AbortError"
        ) {
          console.error(
            "PREFICHA ERROR:",
            error
          );
        }
      } finally {
        if (active) {
          setLoading(
            false
          );
        }
      }
    }

    load();

    return () => {
      active =
        false;

      controller.abort();
    };
  }, [
    game?.id,
  ]);

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
     ESC
  ======================================================= */

  useEffect(() => {
    const handleKeyDown =
      (event) => {
        if (
          event.code ===
          "Escape"
        ) {
          event.preventDefault();

          onClose?.();
        }
      };

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
  ]);

  if (!game?.id) {
    return null;
  }

  const resolvedGame =
    completeGame ||
    game;

  const title =
    resolvedGame?.title ||
    resolvedGame?.name ||
    game?.title ||
    game?.name ||
    "Juego";

  const cover =
    getCover(
      resolvedGame
    ) ||
    getCover(
      game
    );

  const youtubeId =
    chooseFirstVideo(
      resolvedGame
    );

  const year =
    getYear(
      resolvedGame
    );

  const developer =
    getDeveloper(
      resolvedGame
    );

  const platforms =
    getPlatforms(
      resolvedGame
    );

  const genres =
    getGenres(
      resolvedGame
    );

  const accent =
    resolvedGame?.accent ||
    game?.accent ||
    "#5fdcff";

  /* =======================================================
     ABRIR FICHA COMPLETA

     Mandamos la versión completa si ya está cargada.
  ======================================================= */

  function openFullGameCard() {
    window.dispatchEvent(
      new CustomEvent(
        "freaky:open-full-game",
        {
          detail: {
            game:
              completeGame ||
              game,
          },
        }
      )
    );
  }

  /* =======================================================
     MEDIDAS
  ======================================================= */

  const headerHeight =
    horizontal
      ? lowHeight
        ? 52
        : 58
      : 76;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="world-no-select"
      style={{
        position:
          "fixed",

        inset: 0,

        zIndex:
          99999,

        width:
          "100%",

        height:
          "100dvh",

        overflow:
          "hidden",

        boxSizing:
          "border-box",

        background:
          "#080a0d",

        color:
          "#ffffff",

        fontFamily:
          "system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      }}
    >
      {/* ===================================================
          CABECERA
      =================================================== */}

      <header
        style={{
          height:
            headerHeight,

          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "space-between",

          gap:
            12,

          boxSizing:
            "border-box",

          padding:
            horizontal
              ? lowHeight
                ? "7px 12px"
                : "8px 14px"
              : "11px 14px",

          borderBottom:
            `1px solid ${accent}55`,

          background:
            "#050709",
        }}
      >
        <div
          style={{
            minWidth: 0,

            flex: 1,
          }}
        >
          <div
            style={{
              color:
                accent,

              fontSize:
                horizontal
                  ? 8
                  : 9,

              lineHeight: 1,

              fontWeight:
                950,

              letterSpacing:
                ".18em",
            }}
          >
            FREAKY WORLD
          </div>

          <div
            style={{
              marginTop:
                horizontal
                  ? 4
                  : 6,

              overflow:
                "hidden",

              color:
                "#fff",

              fontSize:
                horizontal
                  ? lowHeight
                    ? 17
                    : 19
                  : "clamp(20px,5.8vw,30px)",

              lineHeight:
                1.05,

              fontWeight:
                950,

              letterSpacing:
                "-.025em",

              whiteSpace:
                "nowrap",

              textOverflow:
                "ellipsis",
            }}
          >
            {title}
          </div>
        </div>

        <button
          type="button"
          aria-label="Cerrar preficha"
          onClick={
            onClose
          }
          style={{
            flex:
              "0 0 auto",

            width:
              horizontal
                ? 40
                : 46,

            height:
              horizontal
                ? 40
                : 46,

            display:
              "grid",

            placeItems:
              "center",

            padding: 0,

            border:
              "1px solid rgba(255,255,255,.2)",

            borderRadius:
              "50%",

            background:
              "#1c2227",

            color:
              "#fff",

            fontSize:
              horizontal
                ? 27
                : 31,

            lineHeight: 1,

            fontWeight:
              500,

            cursor:
              "pointer",
          }}
        >
          ×
        </button>
      </header>

      {/* ===================================================
          VERTICAL
      =================================================== */}

      {!horizontal && (
        <main
          style={{
            width:
              "100%",

            height:
              `calc(100dvh - ${headerHeight}px)`,

            maxWidth:
              700,

            margin:
              "0 auto",

            display:
              "grid",

            gridTemplateRows:
              "minmax(0, .92fr) minmax(0, 1.08fr) auto",

            gap:
              10,

            boxSizing:
              "border-box",

            padding:
              "12px 14px max(12px, env(safe-area-inset-bottom))",
          }}
        >
          {/* PORTADA + DATOS */}

          <section
            style={{
              minHeight: 0,

              display:
                "grid",

              gridTemplateColumns:
                "minmax(105px, 35%) minmax(0,1fr)",

              gap:
                12,
            }}
          >
            <CoverCard
              cover={
                cover
              }
              title={
                title
              }
              compact={
                compact
              }
            />

            <div
              style={{
                minWidth: 0,

                minHeight: 0,

                display:
                  "grid",

                gridTemplateRows:
                  "repeat(4,minmax(0,auto))",

                alignContent:
                  "center",

                gap:
                  9,

                padding:
                  "4px 0",
              }}
            >
              {loading && (
                <div
                  style={{
                    color:
                      "#59656c",

                    fontSize:
                      9,

                    fontWeight:
                      700,
                  }}
                >
                  Cargando datos…
                </div>
              )}

              <DataItem
                label="Año"
                value={
                  year
                }
              />

              <DataItem
                label="Desarrollador"
                value={
                  developer
                }
              />

              <DataItem
                label="Plataformas"
                value={
                  platforms
                }
              />

              <DataItem
                label="Género"
                value={
                  genres
                }
              />
            </div>
          </section>

          {/* VIDEO */}

          <section
            style={{
              minHeight: 0,
            }}
          >
            <Trailer
              youtubeId={
                youtubeId
              }
              cover={
                cover
              }
              title={
                title
              }
              compact={
                compact
              }
            />
          </section>

          {/* BOTONES */}

          <section
            style={{
              display:
                "grid",

              gridTemplateColumns:
                "1fr 1fr",

              gap:
                9,
            }}
          >
            <ActionButton
              onClick={
                onClose
              }
              accent={
                accent
              }
            >
              VOLVER AL MUNDO
            </ActionButton>

            <ActionButton
              onClick={
                openFullGameCard
              }
              primary
              accent={
                accent
              }
            >
              VER FICHA COMPLETA
            </ActionButton>
          </section>
        </main>
      )}

      {/* ===================================================
          HORIZONTAL / TABLET / DESKTOP
      =================================================== */}

      {horizontal && (
        <main
          style={{
            width:
              "100%",

            height:
              `calc(100dvh - ${headerHeight}px)`,

            maxWidth:
              1500,

            margin:
              "0 auto",

            display:
              "grid",

            gridTemplateRows:
              "minmax(0,1fr) auto auto",

            gap:
              lowHeight
                ? 7
                : 10,

            boxSizing:
              "border-box",

            padding:
              lowHeight
                ? "8px 12px"
                : "12px 16px",
          }}
        >
          {/* PORTADA + VIDEO */}

          <section
            style={{
              minHeight: 0,

              display:
                "grid",

              gridTemplateColumns:
                desktop
                  ? "minmax(150px,.42fr) minmax(0,1.58fr)"
                  : "minmax(115px,.42fr) minmax(0,1.58fr)",

              gap:
                lowHeight
                  ? 9
                  : 13,

              alignItems:
                "stretch",
            }}
          >
            <CoverCard
              cover={
                cover
              }
              title={
                title
              }
              compact
            />

            <Trailer
              youtubeId={
                youtubeId
              }
              cover={
                cover
              }
              title={
                title
              }
              compact
            />
          </section>

          {/* DATOS EN UNA FILA */}

          <section
            style={{
              minWidth: 0,

              display:
                "grid",

              gridTemplateColumns:
                "minmax(55px,.4fr) minmax(110px,1fr) minmax(130px,1.4fr) minmax(100px,1fr)",

              alignItems:
                "center",

              gap:
                lowHeight
                  ? 8
                  : 14,

              padding:
                lowHeight
                  ? "6px 9px"
                  : "8px 11px",

              overflow:
                "hidden",

              border:
                "1px solid rgba(255,255,255,.08)",

              borderRadius:
                10,

              background:
                "#0e1216",
            }}
          >
            <DataItem
              compact
              label="Año"
              value={
                year
              }
            />

            <DataItem
              compact
              label="Desarrollador"
              value={
                developer
              }
            />

            <DataItem
              compact
              label="Plataformas"
              value={
                platforms
              }
            />

            <DataItem
              compact
              label="Género"
              value={
                genres
              }
            />
          </section>

          {/* BOTONES */}

          <section
            style={{
              display:
                "grid",

              gridTemplateColumns:
                "1fr 1fr",

              gap:
                lowHeight
                  ? 8
                  : 10,
            }}
          >
            <ActionButton
              compact
              onClick={
                onClose
              }
              accent={
                accent
              }
            >
              VOLVER AL MUNDO
            </ActionButton>

            <ActionButton
              compact
              onClick={
                openFullGameCard
              }
              primary
              accent={
                accent
              }
            >
              VER FICHA COMPLETA
            </ActionButton>
          </section>
        </main>
      )}
    </div>
  );
}
