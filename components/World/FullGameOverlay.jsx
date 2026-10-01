"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* =========================================================
   EVENTOS DE AUDIO / VIDEO
========================================================= */

const MEDIA_START_EVENT = "tierra-vicio-media-start";
const MEDIA_END_EVENT = "tierra-vicio-media-end";

/* =========================================================
   HELPERS
========================================================= */

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function normalizeNamedItems(items) {
  return asArray(items)
    .map((item) =>
      typeof item === "string"
        ? item
        : item?.name || item?.title || item?.abbreviation
    )
    .filter(Boolean);
}

function getTitle(game) {
  return game?.title || game?.name || "Juego";
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
  if (game?.year) return game.year;
  if (game?.releaseYear) return game.releaseYear;

  if (game?.releaseDate) {
    const date = new Date(game.releaseDate);

    if (!Number.isNaN(date.getTime())) {
      return date.getFullYear();
    }
  }

  return null;
}

function getScore(game) {
  const official = Number(game?.freakyOfficialScore);

  if (Number.isFinite(official) && official > 0) {
    return {
      value: official > 10 ? official / 10 : official,
      votes: Number(game?.freakyOfficialVotes) || 0,
      source: "official",
    };
  }

  const totalRating = Number(game?.totalRating);

  if (Number.isFinite(totalRating) && totalRating > 0) {
    return {
      value: totalRating > 10 ? totalRating / 10 : totalRating,
      votes: Number(game?.totalRatingCount) || 0,
      source: "igdb",
    };
  }

  const rating = Number(game?.rating);

  if (Number.isFinite(rating) && rating > 0) {
    return {
      value: rating > 10 ? rating / 10 : rating,
      votes: Number(game?.ratingCount) || 0,
      source: "igdb",
    };
  }

  return {
    value: null,
    votes: 0,
    source: null,
  };
}

function getCommunityScore(game) {
  const value = Number(game?.communityScore);

  return {
    value:
      Number.isFinite(value) && value > 0
        ? value > 10
          ? value / 10
          : value
        : null,

    votes: Number(game?.communityVotes) || 0,
  };
}

function formatScore(value) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(Number(value))
  ) {
    return "—";
  }

  return Number(value).toFixed(1);
}

function getYoutubeId(video) {
  return video?.youtubeId || video?.youtube_id || null;
}

function chooseFirstVideo(game) {
  const manual =
    game?.manualTrailer?.youtubeId ||
    game?.manualTrailerYoutubeId;

  if (manual) return manual;

  const videos = asArray(game?.videos);

  const preferences = [
    "launch trailer",
    "official trailer",
    "release trailer",
    "gameplay trailer",
    "trailer",
  ];

  for (const preference of preferences) {
    const found = videos.find((video) =>
      String(video?.name || "")
        .toLowerCase()
        .includes(preference)
    );

    const id = getYoutubeId(found);

    if (id) return id;
  }

  return getYoutubeId(videos[0]);
}

/* =========================================================
   VIEWPORT
========================================================= */

function readViewport() {
  if (typeof window === "undefined") {
    return {
      width: 390,
      height: 700,
    };
  }

  return {
    width:
      document.documentElement?.clientWidth ||
      window.innerWidth ||
      390,

    height:
      window.visualViewport?.height ||
      document.documentElement?.clientHeight ||
      window.innerHeight ||
      700,
  };
}

function useViewport() {
  const [viewport, setViewport] = useState(readViewport);

  useEffect(() => {
    let raf = 0;
    let timeoutA = 0;
    let timeoutB = 0;

    const update = () => {
      cancelAnimationFrame(raf);

      raf = requestAnimationFrame(() => {
        setViewport(readViewport());
      });

      clearTimeout(timeoutA);
      clearTimeout(timeoutB);

      timeoutA = window.setTimeout(() => {
        setViewport(readViewport());
      }, 90);

      timeoutB = window.setTimeout(() => {
        setViewport(readViewport());
      }, 280);
    };

    update();

    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);

    window.visualViewport?.addEventListener(
      "resize",
      update
    );

    return () => {
      cancelAnimationFrame(raf);

      clearTimeout(timeoutA);
      clearTimeout(timeoutB);

      window.removeEventListener("resize", update);
      window.removeEventListener(
        "orientationchange",
        update
      );

      window.visualViewport?.removeEventListener(
        "resize",
        update
      );
    };
  }, []);

  return viewport;
}

/* =========================================================
   YOUTUBE API
========================================================= */

let youtubeApiPromise = null;

function loadYouTubeApi() {
  if (typeof window === "undefined") {
    return Promise.reject();
  }

  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (youtubeApiPromise) {
    return youtubeApiPromise;
  }

  youtubeApiPromise = new Promise((resolve) => {
    const previousCallback =
      window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();

      resolve(window.YT);
    };

    const existing = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]'
    );

    if (!existing) {
      const script = document.createElement("script");

      script.src =
        "https://www.youtube.com/iframe_api";

      script.async = true;

      document.head.appendChild(script);
    }
  });

  return youtubeApiPromise;
}

/* =========================================================
   CLASIFICACIONES
========================================================= */

function normalizeRatingText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function commonsImage(filename) {
  return (
    "https://commons.wikimedia.org/wiki/Special:Redirect/file/" +
    encodeURIComponent(filename)
  );
}

function getAgeRatingBadgeUrl(rating) {
  const organization =
    normalizeRatingText(rating?.organization);

  const value =
    normalizeRatingText(rating?.rating);

  if (organization.includes("pegi")) {
    const age =
      value.match(/\b(3|7|12|16|18)\b/)?.[1];

    if (age) {
      return commonsImage(`PEGI ${age}.svg`);
    }
  }

  if (
    organization.includes("esrb") ||
    organization.includes(
      "entertainment software rating"
    )
  ) {
    if (
      value.includes("adults only") ||
      value === "ao"
    ) {
      return commonsImage(
        "ESRB 2013 Adults Only 18+.svg"
      );
    }

    if (
      value.includes("mature") ||
      value === "m"
    ) {
      return commonsImage(
        "ESRB 2013 Mature.svg"
      );
    }

    if (
      value.includes("teen") ||
      value === "t"
    ) {
      return commonsImage(
        "ESRB 2013 Teen.svg"
      );
    }

    if (
      value.includes("everyone 10") ||
      value === "e10+" ||
      value === "e10"
    ) {
      return commonsImage(
        "ESRB 2013 Everyone 10+.svg"
      );
    }

    if (
      value.includes("everyone") ||
      value === "e"
    ) {
      return commonsImage(
        "ESRB 2013 Everyone.svg"
      );
    }
  }

  if (
    organization.includes("cero") ||
    organization.includes(
      "computer entertainment rating"
    )
  ) {
    const letter =
      value
        .toUpperCase()
        .match(/\b(A|B|C|D|Z)\b/)?.[1];

    if (letter) {
      return commonsImage(`CERO ${letter}.svg`);
    }
  }

  if (
    organization.includes("usk") ||
    organization.includes(
      "unterhaltungssoftware"
    )
  ) {
    const age =
      value.match(/\b(0|6|12|16|18)\b/)?.[1];

    if (age) {
      return commonsImage(`USK ${age}.svg`);
    }
  }

  return null;
}

/* =========================================================
   ESTILOS BASE
========================================================= */

function navButtonStyle(size = 40) {
  return {
    width: size,
    height: size,
    flex: "0 0 auto",
    display: "grid",
    placeItems: "center",
    padding: 0,

    border:
      "1px solid rgba(255,255,255,.15)",

    borderRadius: "50%",

    background:
      "rgba(15,19,24,.96)",

    color: "#ffffff",

    fontSize:
      size === 40 ? 24 : 21,

    lineHeight: 1,

    cursor: "pointer",

    touchAction: "manipulation",
  };
}

function expandButtonStyle(
  accent = "#5fdcff"
) {
  return {
    marginTop: 9,

    padding: "3px 0",

    border: 0,

    background: "transparent",

    color: accent,

    fontSize: 10,

    fontWeight: 850,

    letterSpacing: ".015em",

    cursor: "pointer",

    touchAction: "manipulation",
  };
}

/* =========================================================
   SECTION
========================================================= */

function Section({
  title,
  children,
  style,
  compact = false,
}) {
  return (
    <section
      style={{
        padding: compact ? 12 : 14,

        border:
          "1px solid rgba(255,255,255,.085)",

        borderRadius: 16,

        background:
          "linear-gradient(180deg,rgba(18,22,28,.98),rgba(14,17,22,.98))",

        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,.025)",

        ...style,
      }}
    >
      {title && (
        <h2
          style={{
            margin:
              `0 0 ${compact ? 9 : 11}px`,

            color: "#f5f7f8",

            fontSize:
              compact ? 14 : 15,

            lineHeight: 1.2,

            fontWeight: 900,

            letterSpacing: "-.01em",
          }}
        >
          {title}
        </h2>
      )}

      {children}
    </section>
  );
}

/* =========================================================
   CHIP
========================================================= */

function Chip({
  children,
  accent = "#5fdcff",
  strong = false,
}) {
  return (
    <span
      style={{
        display: "inline-flex",

        alignItems: "center",

        minHeight:
          strong ? 25 : 24,

        padding:
          strong
            ? "3px 8px"
            : "3px 8px",

        border:
          `1px solid ${accent}${
            strong ? "38" : "28"
          }`,

        borderRadius: 9,

        background:
          strong
            ? `${accent}0D`
            : "rgba(255,255,255,.03)",

        color:
          strong
            ? "#e6edf0"
            : "#d4dce0",

        fontSize: 10,

        lineHeight: 1.25,

        fontWeight:
          strong ? 750 : 700,

        whiteSpace: "normal",

        overflowWrap: "anywhere",
      }}
    >
      {children}
    </span>
  );
}

/* =========================================================
   SCORE
========================================================= */

function ScoreBox({
  icon,
  label,
  value,
  accent,
}) {
  return (
    <div
      style={{
        minWidth: 0,

        display: "grid",

        gridTemplateColumns:
          "auto minmax(0,1fr)",

        alignItems: "center",

        gap: 8,

        padding: "9px 10px",

        border:
          "1px solid rgba(255,255,255,.075)",

        borderRadius: 12,

        background: "#0d1014",
      }}
    >
      <div
        style={{
          width: 30,

          height: 30,

          display: "grid",

          placeItems: "center",

          borderRadius: "50%",

          background:
            "rgba(255,255,255,.055)",

          fontSize: 17,

          lineHeight: 1,
        }}
      >
        {icon}
      </div>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            color: "#7d878e",

            fontSize: 7,

            fontWeight: 850,

            textTransform:
              "uppercase",

            letterSpacing: ".05em",

            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>

        <div
          style={{
            marginTop: 3,

            color:
              accent || "#ffffff",

            fontSize: 19,

            lineHeight: 1,

            fontWeight: 950,
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function ScoreStrip({
  official,
  community,
  accent,
}) {
  return (
    <div
      style={{
        display: "grid",

        gridTemplateColumns:
          "repeat(3,minmax(0,1fr))",

        gap: 6,

        width: "100%",
      }}
    >
      <ScoreBox
        icon="🏅"
        label="Oficial"
        value={formatScore(
          official?.value
        )}
        accent={accent}
      />

      <ScoreBox
        icon="⭐"
        label="Comunidad"
        value={formatScore(
          community?.value
        )}
      />

      <ScoreBox
        icon="♥"
        label="Mi valoración"
        value="—"
        accent="#ff5b75"
      />
    </div>
  );
}

/* =========================================================
   DATOS
========================================================= */

function HeroData({
  label,
  value,
}) {
  return (
    <div style={{ minWidth: 0 }}>
      <div
        style={{
          color: "#727c83",

          fontSize: 7,

          textTransform:
            "uppercase",

          fontWeight: 850,
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: 3,

          overflow: "hidden",

          textOverflow:
            "ellipsis",

          whiteSpace: "nowrap",

          color: "#dce1e4",

          fontSize: 9,

          fontWeight: 750,
        }}
      >
        {value || "—"}
      </div>
    </div>
  );
}

function DataRow({
  label,
  value,
}) {
  if (!value) return null;

  return (
    <div
      style={{
        display: "grid",

        gridTemplateColumns:
          "92px minmax(0,1fr)",

        gap: 8,

        padding: "7px 0",

        borderBottom:
          "1px solid rgba(255,255,255,.045)",
      }}
    >
      <div
        style={{
          color: "#7f8990",

          fontSize: 9,

          lineHeight: 1.4,

          fontWeight: 760,
        }}
      >
        {label}
      </div>

      <div
        style={{
          minWidth: 0,

          color: "#d8dde0",

          fontSize: 10,

          lineHeight: 1.4,

          overflowWrap:
            "anywhere",
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* =========================================================
   TEXTO COLAPSABLE

   IMPORTANTE:
   MISMO TAMAÑO EN VERTICAL Y HORIZONTAL
========================================================= */

function CollapsibleText({
  children,
  lines = 4,
  accent = "#5fdcff",
}) {
  const [expanded, setExpanded] =
    useState(false);

  if (!children) return null;

  return (
    <div>
      <div
        style={{
          display:
            expanded
              ? "block"
              : "-webkit-box",

          WebkitLineClamp:
            expanded
              ? undefined
              : lines,

          WebkitBoxOrient:
            "vertical",

          overflow: "hidden",

          color: "#c4cbd0",

          fontSize: 12,

          lineHeight: 1.55,

          whiteSpace: "pre-line",
        }}
      >
        {children}
      </div>

      <button
        type="button"
        onClick={() =>
          setExpanded(
            (current) => !current
          )
        }
        style={
          expandButtonStyle(
            accent
          )
        }
      >
        {expanded
          ? "VER MENOS"
          : "VER MÁS"}
      </button>
    </div>
  );
}

/* =========================================================
   VIDEO + SINCRONIZACIÓN RADIO
========================================================= */

function VideoPlayer({
  game,
  fillHeight = false,
}) {
  const videos = useMemo(() => {
    const ids =
      asArray(game?.videos)
        .map(getYoutubeId)
        .filter(Boolean);

    return unique([
      chooseFirstVideo(game),
      ...ids,
    ]);
  }, [game]);

  const [activeIndex, setActiveIndex] =
    useState(0);

  const playerHostRef =
    useRef(null);

  const playerRef =
    useRef(null);

  const mediaActiveRef =
    useRef(false);

  useEffect(() => {
    setActiveIndex(0);
  }, [game?.id]);

  const safeIndex =
    Math.min(
      activeIndex,
      Math.max(
        videos.length - 1,
        0
      )
    );

  const videoId =
    videos[safeIndex];

  function notifyMediaStart() {
    if (
      mediaActiveRef.current
    ) {
      return;
    }

    mediaActiveRef.current =
      true;

    window.dispatchEvent(
      new CustomEvent(
        MEDIA_START_EVENT
      )
    );
  }

  function notifyMediaEnd() {
    if (
      !mediaActiveRef.current
    ) {
      return;
    }

    mediaActiveRef.current =
      false;

    window.dispatchEvent(
      new CustomEvent(
        MEDIA_END_EVENT
      )
    );
  }

  useEffect(() => {
    if (
      !videoId ||
      !playerHostRef.current
    ) {
      return;
    }

    let cancelled = false;

    notifyMediaEnd();

    loadYouTubeApi()
      .then((YT) => {
        if (
          cancelled ||
          !playerHostRef.current
        ) {
          return;
        }

        try {
          playerRef.current?.destroy?.();
        } catch {
          // Nada.
        }

        playerHostRef.current.innerHTML =
          "";

        playerRef.current =
          new YT.Player(
            playerHostRef.current,
            {
              videoId,

              playerVars: {
                playsinline: 1,
                rel: 0,
                controls: 1,
              },

              events: {
                onStateChange:
                  (event) => {
                    if (
                      event.data ===
                      YT.PlayerState
                        .PLAYING
                    ) {
                      notifyMediaStart();
                    }

                    if (
                      event.data ===
                        YT.PlayerState
                          .PAUSED ||
                      event.data ===
                        YT.PlayerState
                          .ENDED
                    ) {
                      notifyMediaEnd();
                    }
                  },
              },
            }
          );
      })
      .catch(() => {
        // Si falla la API,
        // simplemente no hay player.
      });

    return () => {
      cancelled = true;

      notifyMediaEnd();

      try {
        playerRef.current?.destroy?.();
      } catch {
        // Nada.
      }

      playerRef.current = null;
    };
  }, [videoId]);

  if (!videos.length) {
    return (
      <div
        style={{
          width: "100%",

          height:
            fillHeight
              ? "100%"
              : "auto",

          minHeight:
            fillHeight
              ? 200
              : 180,

          aspectRatio:
            fillHeight
              ? undefined
              : "16 / 9",

          display: "grid",

          placeItems: "center",

          borderRadius: 14,

          overflow: "hidden",

          background: "#0c0f13",

          color: "#68727a",

          fontSize: 10,
        }}
      >
        Sin vídeo disponible
      </div>
    );
  }

  const arrowStyle = {
    position: "absolute",

    top: "50%",

    transform:
      "translateY(-50%)",

    zIndex: 8,

    width: 36,

    height: 36,

    display: "grid",

    placeItems: "center",

    padding: 0,

    border:
      "1px solid rgba(255,255,255,.30)",

    borderRadius: "50%",

    background:
      "rgba(0,0,0,.58)",

    color: "#ffffff",

    fontSize: 27,

    lineHeight: 1,

    cursor: "pointer",

    touchAction: "manipulation",

    backdropFilter:
      "blur(4px)",

    WebkitBackdropFilter:
      "blur(4px)",
  };

  const previousVideo = () => {
    notifyMediaEnd();

    setActiveIndex(
      (current) =>
        (
          current -
          1 +
          videos.length
        ) %
        videos.length
    );
  };

  const nextVideo = () => {
    notifyMediaEnd();

    setActiveIndex(
      (current) =>
        (current + 1) %
        videos.length
    );
  };

  return (
    <div
      style={{
        width: "100%",

        height:
          fillHeight
            ? "100%"
            : "auto",

        minWidth: 0,
      }}
    >
      <div
        style={{
          position: "relative",

          width: "100%",

          height:
            fillHeight
              ? "100%"
              : "auto",

          minHeight: 0,

          aspectRatio:
            fillHeight
              ? undefined
              : "16 / 9",

          overflow: "hidden",

          borderRadius: 14,

          background: "#000",
        }}
      >
        <div
          ref={playerHostRef}
          style={{
            position:
              "absolute",

            inset: 0,

            width: "100%",

            height: "100%",
          }}
        />

        {videos.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Vídeo anterior"
              onClick={
                previousVideo
              }
              style={{
                ...arrowStyle,
                left: 8,
              }}
            >
              ‹
            </button>

            <button
              type="button"
              aria-label="Vídeo siguiente"
              onClick={
                nextVideo
              }
              style={{
                ...arrowStyle,
                right: 8,
              }}
            >
              ›
            </button>

            <div
              style={{
                position:
                  "absolute",

                left: 8,

                bottom: 8,

                zIndex: 8,

                padding:
                  "5px 8px",

                borderRadius:
                  999,

                background:
                  "rgba(0,0,0,.72)",

                color:
                  "#ffffff",

                fontSize: 9,

                fontWeight:
                  850,

                lineHeight: 1,

                pointerEvents:
                  "none",
              }}
            >
              {safeIndex + 1} de{" "}
              {videos.length}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   GALERÍA
========================================================= */

function Gallery({ game }) {
  const images = useMemo(() => {
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
    fullscreen,
    setFullscreen,
  ] = useState(false);

  const [
    activeIndex,
    setActiveIndex,
  ] = useState(0);

  const scrollRef =
    useRef(null);

  if (!images.length) {
    return null;
  }

  const move = (direction) => {
    scrollRef.current?.scrollBy({
      left:
        direction *
        Math.max(
          240,
          scrollRef.current
            .clientWidth *
            0.8
        ),

      behavior: "smooth",
    });
  };

  const openImage = (index) => {
    setActiveIndex(index);

    setFullscreen(true);
  };

  const previous = () => {
    setActiveIndex(
      (current) =>
        (
          current -
          1 +
          images.length
        ) %
        images.length
    );
  };

  const next = () => {
    setActiveIndex(
      (current) =>
        (current + 1) %
        images.length
    );
  };

  return (
    <>
      <Section title="Galería">
        <div
          style={{
            position:
              "relative",
          }}
        >
          <div
            ref={scrollRef}
            style={{
              display: "flex",

              gap: 8,

              overflowX:
                "auto",

              scrollbarWidth:
                "none",

              WebkitOverflowScrolling:
                "touch",
            }}
          >
            {images.map(
              (
                image,
                index
              ) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() =>
                    openImage(
                      index
                    )
                  }
                  style={{
                    flex:
                      "0 0 min(72vw,380px)",

                    height: 220,

                    padding: 0,

                    overflow:
                      "hidden",

                    border:
                      "1px solid rgba(255,255,255,.08)",

                    borderRadius:
                      12,

                    background:
                      "#080a0d",
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

          {images.length >
            1 && (
            <div
              style={{
                display:
                  "flex",

                justifyContent:
                  "flex-end",

                gap: 6,

                marginTop: 8,
              }}
            >
              <button
                type="button"
                onClick={() =>
                  move(-1)
                }
                style={
                  navButtonStyle(
                    36
                  )
                }
              >
                ‹
              </button>

              <button
                type="button"
                onClick={() =>
                  move(1)
                }
                style={
                  navButtonStyle(
                    36
                  )
                }
              >
                ›
              </button>
            </div>
          )}
        </div>
      </Section>

      {fullscreen && (
        <div
          onClick={() =>
            setFullscreen(
              false
            )
          }
          style={{
            position:
              "fixed",

            inset: 0,

            zIndex: 400000,

            display: "grid",

            placeItems:
              "center",

            padding: 18,

            background:
              "rgba(0,0,0,.96)",
          }}
        >
          <button
            type="button"
            onClick={() =>
              setFullscreen(
                false
              )
            }
            style={{
              ...navButtonStyle(),

              position:
                "absolute",

              top: 14,

              right: 14,

              zIndex: 3,
            }}
          >
            ×
          </button>

          {images.length >
            1 && (
            <>
              <button
                type="button"
                onClick={(
                  event
                ) => {
                  event.stopPropagation();

                  previous();
                }}
                style={{
                  ...navButtonStyle(),

                  position:
                    "absolute",

                  left: 14,

                  top: "50%",

                  transform:
                    "translateY(-50%)",
                }}
              >
                ‹
              </button>

              <button
                type="button"
                onClick={(
                  event
                ) => {
                  event.stopPropagation();

                  next();
                }}
                style={{
                  ...navButtonStyle(),

                  position:
                    "absolute",

                  right: 14,

                  top: "50%",

                  transform:
                    "translateY(-50%)",
                }}
              >
                ›
              </button>
            </>
          )}

          <img
            src={
              images[
                activeIndex
              ]
            }
            alt=""
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
            style={{
              maxWidth:
                "94vw",

              maxHeight:
                "88dvh",

              width: "auto",

              height: "auto",

              objectFit:
                "contain",

              borderRadius:
                12,
            }}
          />

          <div
            style={{
              position:
                "absolute",

              bottom: 15,

              padding:
                "6px 11px",

              borderRadius:
                999,

              background:
                "rgba(0,0,0,.75)",

              fontSize: 10,

              fontWeight:
                800,
            }}
          >
            {activeIndex + 1} de{" "}
            {images.length}
          </div>
        </div>
      )}
    </>
  );
}

/* =========================================================
   CARACTERÍSTICAS
========================================================= */

function FeatureGroup({
  label,
  values,
  accent,
}) {
  if (!values?.length) {
    return null;
  }

  return (
    <div
      style={{
        minWidth: 0,

        padding:
          "10px 10px 11px",

        border:
          "1px solid rgba(255,255,255,.07)",

        borderRadius: 12,

        background:
          "linear-gradient(180deg,#11151a,#0e1216)",
      }}
    >
      <div
        style={{
          display: "flex",

          alignItems:
            "center",

          gap: 7,

          marginBottom: 8,

          color: "#edf1f3",

          fontSize: 10,

          lineHeight: 1.25,

          fontWeight: 850,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 3,

            height: 12,

            flex:
              "0 0 3px",

            borderRadius:
              999,

            background:
              accent,
          }}
        />

        {label}
      </div>

      <div
        style={{
          display: "flex",

          flexWrap: "wrap",

          alignItems:
            "flex-start",

          gap: 5,
        }}
      >
        {values.map(
          (value) => (
            <Chip
              key={value}
              accent={accent}
              strong
            >
              {value}
            </Chip>
          )
        )}
      </div>
    </div>
  );
}

function Features({
  genres,
  themes,
  gameModes,
  perspectives,
  accent,
}) {
  const groups = [
    {
      label: "Géneros",
      values: genres,
    },

    {
      label: "Temas",
      values: themes,
    },

    {
      label:
        "Modos de juego",
      values: gameModes,
    },

    {
      label:
        "Perspectiva",
      values: perspectives,
    },
  ].filter(
    (group) =>
      group.values?.length
  );

  if (!groups.length) {
    return null;
  }

  return (
    <Section
      title="Características"
      compact
    >
      <div
        style={{
          display: "grid",

          gridTemplateColumns:
            "repeat(2,minmax(0,1fr))",

          alignItems:
            "start",

          gap: 7,
        }}
      >
        {groups.map(
          (group) => (
            <FeatureGroup
              key={
                group.label
              }
              label={
                group.label
              }
              values={
                group.values
              }
              accent={
                accent
              }
            />
          )
        )}
      </div>
    </Section>
  );
}

/* =========================================================
   TÍTULOS
========================================================= */

function cleanAlternativeNames(
  items
) {
  return asArray(items).filter(
    (item) => {
      const name =
        typeof item ===
        "string"
          ? item
          : item?.name;

      if (!name) {
        return false;
      }

      const comment =
        String(
          typeof item ===
            "string"
            ? ""
            : item?.comment ||
                ""
        ).toLowerCase();

      const nameLower =
        String(
          name
        ).toLowerCase();

      if (
        comment.includes(
          "executable"
        ) ||
        comment.includes(
          ".exe"
        ) ||
        nameLower.endsWith(
          ".exe"
        )
      ) {
        return false;
      }

      return true;
    }
  );
}

function titleCommentLabel(
  comment
) {
  const value =
    String(
      comment || ""
    )
      .trim()
      .toLowerCase();

  if (!value) {
    return "Alternativo";
  }

  if (
    value.includes(
      "acronym"
    )
  ) {
    return "Acrónimo";
  }

  if (
    value.includes(
      "abbreviation"
    )
  ) {
    return "Abreviatura";
  }

  if (
    value.includes(
      "stylized"
    )
  ) {
    return "Estilizado";
  }

  if (
    value.includes(
      "romanization"
    )
  ) {
    return "Romanización";
  }

  if (
    value.includes(
      "japanese"
    )
  ) {
    return "Japón";
  }

  if (
    value.includes(
      "korean"
    )
  ) {
    return "Corea";
  }

  if (
    value.includes(
      "taiwan"
    )
  ) {
    return "Taiwán";
  }

  if (
    value.includes(
      "chinese"
    )
  ) {
    return "China";
  }

  if (
    value.includes(
      "spanish"
    )
  ) {
    return "España";
  }

  if (
    value.includes(
      "french"
    )
  ) {
    return "Francia";
  }

  if (
    value.includes(
      "german"
    )
  ) {
    return "Alemania";
  }

  if (
    value.includes(
      "italian"
    )
  ) {
    return "Italia";
  }

  if (
    value.includes(
      "portuguese"
    )
  ) {
    return "Portugal";
  }

  if (
    value.includes(
      "brazil"
    )
  ) {
    return "Brasil";
  }

  if (
    value.includes(
      "russian"
    )
  ) {
    return "Rusia";
  }

  return (
    comment ||
    "Alternativo"
  );
}

function isLocalizedTitle(
  item
) {
  if (
    typeof item ===
    "string"
  ) {
    return false;
  }

  const comment =
    String(
      item?.comment || ""
    ).toLowerCase();

  if (
    comment.includes(
      "romanization"
    )
  ) {
    return false;
  }

  return [
    "japanese",
    "korean",
    "chinese",
    "taiwan",
    "spanish",
    "french",
    "german",
    "italian",
    "portuguese",
    "brazil",
    "russian",
  ].some((word) =>
    comment.includes(word)
  );
}

function TitleList({
  title,
  items,
}) {
  if (!items.length) {
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
          marginBottom: 7,

          color: "#8b959c",

          fontSize: 9,

          lineHeight: 1.3,

          fontWeight: 850,

          textTransform:
            "uppercase",

          letterSpacing:
            ".035em",
        }}
      >
        {title}
      </div>

      <div
        style={{
          display: "grid",

          gap: 7,
        }}
      >
        {items.map(
          (item, index) => {
            const name =
              typeof item ===
              "string"
                ? item
                : item?.name;

            const comment =
              typeof item ===
              "string"
                ? ""
                : item?.comment;

            return (
              <div
                key={
                  item?.id ||
                  `${name}-${index}`
                }
                style={{
                  fontSize: 10,

                  lineHeight:
                    1.45,

                  overflowWrap:
                    "anywhere",
                }}
              >
                <span
                  style={{
                    color:
                      "#838d94",

                    fontWeight:
                      700,
                  }}
                >
                  {titleCommentLabel(
                    comment
                  )}
                  :
                </span>{" "}

                <span
                  style={{
                    color:
                      "#d5dade",
                  }}
                >
                  {name}
                </span>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}

function Titles({
  game,
  accent,
  portrait,
}) {
  const allTitles =
    cleanAlternativeNames(
      game?.alternativeNames
    );

  const [
    expanded,
    setExpanded,
  ] = useState(false);

  useEffect(() => {
    setExpanded(false);
  }, [game?.id]);

  if (!allTitles.length) {
    return null;
  }

  const limit = 8;

  const visible =
    expanded
      ? allTitles
      : allTitles.slice(
          0,
          limit
        );

  const localized =
    visible.filter(
      isLocalizedTitle
    );

  const alternatives =
    visible.filter(
      (item) =>
        !isLocalizedTitle(
          item
        )
    );

  return (
    <Section
      title="Títulos"
      compact
    >
      <div
        style={{
          display: "grid",

          gridTemplateColumns:
            portrait
              ? "1fr"
              : "repeat(2,minmax(0,1fr))",

          gap: 14,
        }}
      >
        <TitleList
          title="Localizados"
          items={localized}
        />

        <TitleList
          title="Alternativos"
          items={alternatives}
        />
      </div>

      {allTitles.length >
        limit && (
        <button
          type="button"
          onClick={() =>
            setExpanded(
              (current) =>
                !current
            )
          }
          style={
            expandButtonStyle(
              accent
            )
          }
        >
          {expanded
            ? "VER MENOS"
            : `VER TODOS LOS TÍTULOS (${allTitles.length})`}
        </button>
      )}
    </Section>
  );
}

/* =========================================================
   IDIOMAS
   5 VISIBLES SIEMPRE
========================================================= */

function Languages({
  game,
  accent,
}) {
  const languages =
    asArray(game?.languages);

  const [
    expanded,
    setExpanded,
  ] = useState(false);

  useEffect(() => {
    setExpanded(false);
  }, [game?.id]);

  if (!languages.length) {
    return null;
  }

  const VISIBLE_COUNT = 5;

  const visible =
    expanded
      ? languages
      : languages.slice(
          0,
          VISIBLE_COUNT
        );

  const flag = (value) =>
    value ? "✓" : "—";

  return (
    <Section
      title="Idiomas"
      compact
    >
      <div
        style={{
          overflowX:
            "auto",

          border:
            "1px solid rgba(255,255,255,.05)",

          borderRadius:
            11,

          background:
            "rgba(6,8,11,.28)",
        }}
      >
        <table
          style={{
            width: "100%",

            minWidth: 310,

            borderCollapse:
              "collapse",
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
                        "6px 7px",

                      color:
                        "#7f8a91",

                      fontSize:
                        8,

                      fontWeight:
                        800,

                      textAlign:
                        label ===
                        "Idioma"
                          ? "left"
                          : "center",

                      borderBottom:
                        "1px solid rgba(255,255,255,.055)",
                    }}
                  >
                    {label}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {visible.map(
              (
                language,
                index
              ) => (
                <tr
                  key={
                    language?.id ||
                    index
                  }
                >
                  <td
                    style={{
                      padding:
                        "6px 7px",

                      color:
                        "#d5dade",

                      fontSize:
                        10,

                      fontWeight:
                        650,

                      borderBottom:
                        "1px solid rgba(255,255,255,.035)",
                    }}
                  >
                    {language?.nativeName ||
                      language?.name ||
                      language?.languageName ||
                      "Idioma"}
                  </td>

                  {[
                    language?.audio,
                    language?.subtitles,
                    language?.interface,
                  ].map(
                    (
                      value,
                      columnIndex
                    ) => (
                      <td
                        key={
                          columnIndex
                        }
                        style={{
                          padding:
                            "6px 5px",

                          textAlign:
                            "center",

                          color:
                            value
                              ? accent
                              : "#737c82",

                          fontSize:
                            value
                              ? 14
                              : 11,

                          fontWeight:
                            850,

                          borderBottom:
                            "1px solid rgba(255,255,255,.035)",
                        }}
                      >
                        {flag(
                          value
                        )}
                      </td>
                    )
                  )}
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {languages.length >
        VISIBLE_COUNT && (
        <button
          type="button"
          onClick={() =>
            setExpanded(
              (current) =>
                !current
            )
          }
          style={{
            ...expandButtonStyle(
              accent
            ),

            width: "100%",

            textAlign:
              "center",
          }}
        >
          {expanded
            ? "VER MENOS"
            : `VER LOS ${languages.length} IDIOMAS SOPORTADOS`}
        </button>
      )}
    </Section>
  );
}

/* =========================================================
   SELLO CLASIFICACIÓN
========================================================= */

function AgeRatingBadge({
  rating,
  size = 64,
}) {
  const [
    imageError,
    setImageError,
  ] = useState(false);

  const badgeUrl =
    getAgeRatingBadgeUrl(
      rating
    );

  if (
    badgeUrl &&
    !imageError
  ) {
    return (
      <img
        src={badgeUrl}
        alt={`${rating?.organization || ""} ${rating?.rating || ""}`}
        loading="lazy"
        onError={() =>
          setImageError(
            true
          )
        }
        style={{
          width: size,

          height: size,

          objectFit:
            "contain",

          display:
            "block",
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,

        height: size,

        display: "grid",

        placeItems:
          "center",

        padding: 5,

        boxSizing:
          "border-box",

        border:
          "1px solid rgba(255,255,255,.13)",

        borderRadius: 9,

        background:
          "#090b0e",

        textAlign:
          "center",
      }}
    >
      <div>
        <div
          style={{
            color:
              "#8a949a",

            fontSize: 7,

            fontWeight:
              850,

            textTransform:
              "uppercase",
          }}
        >
          {rating?.organization ||
            "Rating"}
        </div>

        <div
          style={{
            marginTop: 4,

            color:
              "#ffffff",

            fontSize: 16,

            lineHeight: 1,

            fontWeight:
              950,
          }}
        >
          {rating?.rating ||
            "—"}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   CLASIFICACIÓN
========================================================= */

function AgeRatings({
  game,
  accent,
  portrait,
}) {
  const ratings =
    asArray(
      game?.ageRatings
    );

  const [
    activeIndex,
    setActiveIndex,
  ] = useState(null);

  const rootRef =
    useRef(null);

  useEffect(() => {
    setActiveIndex(null);
  }, [
    game?.id,
    portrait,
  ]);

  useEffect(() => {
    const handlePointerDown =
      (event) => {
        if (
          !rootRef.current?.contains(
            event.target
          )
        ) {
          setActiveIndex(
            null
          );
        }
      };

    const handleScroll =
      () => {
        setActiveIndex(
          null
        );
      };

    document.addEventListener(
      "pointerdown",
      handlePointerDown,
      true
    );

    document.addEventListener(
      "scroll",
      handleScroll,
      true
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown,
        true
      );

      document.removeEventListener(
        "scroll",
        handleScroll,
        true
      );
    };
  }, []);

  if (!ratings.length) {
    return null;
  }

  const activeRating =
    activeIndex === null
      ? null
      : ratings[
          activeIndex
        ];

  const descriptors =
    asArray(
      activeRating?.contentDescriptors ||
        activeRating?.descriptors
    );

  return (
    <Section
      title="Clasificación"
      compact
    >
      <div ref={rootRef}>
        <div
          style={{
            display: "grid",

            gridTemplateColumns:
              "repeat(auto-fit,minmax(62px,72px))",

            gap: 8,

            justifyContent:
              "start",

            alignItems:
              "center",
          }}
        >
          {ratings.map(
            (
              rating,
              index
            ) => {
              const selected =
                activeIndex ===
                index;

              return (
                <button
                  key={
                    rating?.id ||
                    `${rating?.organization}-${rating?.rating}-${index}`
                  }
                  type="button"
                  aria-expanded={
                    selected
                  }
                  aria-label={`Ver detalle ${rating?.organization || "clasificación"} ${rating?.rating || ""}`}
                  onClick={(
                    event
                  ) => {
                    event.stopPropagation();

                    setActiveIndex(
                      (
                        current
                      ) =>
                        current ===
                        index
                          ? null
                          : index
                    );
                  }}
                  style={{
                    width:
                      "100%",

                    minWidth:
                      0,

                    padding:
                      4,

                    display:
                      "grid",

                    placeItems:
                      "center",

                    border:
                      selected
                        ? `1px solid ${accent}88`
                        : "1px solid transparent",

                    borderRadius:
                      11,

                    background:
                      selected
                        ? `${accent}0D`
                        : "transparent",

                    boxShadow:
                      selected
                        ? `0 0 0 1px ${accent}18, 0 0 18px ${accent}14`
                        : "none",

                    cursor:
                      "pointer",

                    touchAction:
                      "manipulation",
                  }}
                >
                  <AgeRatingBadge
                    rating={
                      rating
                    }
                    size={
                      62
                    }
                  />
                </button>
              );
            }
          )}
        </div>

        {activeRating && (
          <div
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
            style={{
              marginTop:
                10,

              padding:
                "10px 11px",

              border:
                `1px solid ${accent}2A`,

              borderRadius:
                12,

              background:
                "linear-gradient(180deg,rgba(16,21,27,.98),rgba(12,16,21,.98))",
            }}
          >
            <div
              style={{
                display:
                  "flex",

                alignItems:
                  "baseline",

                flexWrap:
                  "wrap",

                gap:
                  "4px 8px",
              }}
            >
              <strong
                style={{
                  color:
                    "#ffffff",

                  fontSize:
                    12,

                  fontWeight:
                    900,
                }}
              >
                {activeRating?.organization ||
                  "Clasificación"}
              </strong>

              <span
                style={{
                  color:
                    accent,

                  fontSize:
                    13,

                  fontWeight:
                    950,
                }}
              >
                {activeRating?.rating ||
                  "—"}
              </span>
            </div>

            {descriptors.length >
              0 && (
              <div
                style={{
                  display:
                    "flex",

                  flexWrap:
                    "wrap",

                  gap: 5,

                  marginTop:
                    7,
                }}
              >
                {descriptors.map(
                  (
                    descriptor,
                    descriptorIndex
                  ) => (
                    <span
                      key={
                        descriptorIndex
                      }
                      style={{
                        padding:
                          "3px 6px",

                        borderRadius:
                          8,

                        background:
                          "rgba(255,255,255,.055)",

                        color:
                          "#b7c0c5",

                        fontSize:
                          8,

                        fontWeight:
                          700,
                      }}
                    >
                      {typeof descriptor ===
                      "string"
                        ? descriptor
                        : descriptor?.name ||
                          descriptor?.description ||
                          "Contenido"}
                    </span>
                  )
                )}
              </div>
            )}

            {activeRating?.synopsis &&
              activeRating.synopsis !==
                "No Rating Summary" && (
                <div
                  style={{
                    marginTop:
                      8,

                    color:
                      "#c0c7cc",

                    fontSize:
                      10,

                    lineHeight:
                      1.45,
                  }}
                >
                  {
                    activeRating.synopsis
                  }
                </div>
              )}
          </div>
        )}
      </div>
    </Section>
  );
}

/* =========================================================
   SIMILARES
========================================================= */

function SimilarGames({
  game,
  accent,
  onOpenGame,
}) {
  const similar =
    asArray(
      game?.similarGames
    ).filter(
      (item) =>
        item?.available &&
        item?.id &&
        item?.name
    );

  const scrollRef =
    useRef(null);

  if (!similar.length) {
    return null;
  }

  const move = (direction) => {
    scrollRef.current?.scrollBy({
      left:
        direction *
        Math.max(
          180,
          scrollRef.current
            .clientWidth *
            0.72
        ),

      behavior:
        "smooth",
    });
  };

  return (
    <Section title="Juegos similares">
      <div
        ref={scrollRef}
        style={{
          display: "flex",

          gap: 10,

          overflowX:
            "auto",

          paddingBottom:
            4,

          WebkitOverflowScrolling:
            "touch",

          scrollbarWidth:
            "none",
        }}
      >
        {similar.map(
          (item) => {
            const cover =
              getCover(
                item
              );

            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  onOpenGame(
                    item
                  )
                }
                style={{
                  flex:
                    "0 0 138px",

                  width: 138,

                  padding: 0,

                  overflow:
                    "hidden",

                  border:
                    "1px solid rgba(255,255,255,.08)",

                  borderRadius:
                    12,

                  background:
                    "#0d1014",

                  color:
                    "#ffffff",

                  textAlign:
                    "left",
                }}
              >
                <div
                  style={{
                    aspectRatio:
                      "3 / 4",

                    background:
                      "#080a0d",
                  }}
                >
                  {cover && (
                    <img
                      src={
                        cover
                      }
                      alt={
                        item.name
                      }
                      loading="lazy"
                      style={{
                        width:
                          "100%",

                        height:
                          "100%",

                        objectFit:
                          "cover",
                      }}
                    />
                  )}
                </div>

                <div
                  style={{
                    padding:
                      "8px 8px 9px",
                  }}
                >
                  <div
                    style={{
                      minHeight:
                        30,

                      fontSize:
                        10,

                      lineHeight:
                        1.35,

                      fontWeight:
                        800,
                    }}
                  >
                    {item.name}
                  </div>

                  <div
                    style={{
                      marginTop:
                        4,

                      color:
                        accent,

                      fontSize:
                        8,
                    }}
                  >
                    {item.year ||
                      "Ver ficha"}
                  </div>
                </div>
              </button>
            );
          }
        )}
      </div>

      {similar.length >
        2 && (
        <div
          style={{
            display: "flex",

            justifyContent:
              "flex-end",

            gap: 6,

            marginTop: 8,
          }}
        >
          <button
            type="button"
            onClick={() =>
              move(-1)
            }
            style={
              navButtonStyle(
                36
              )
            }
          >
            ‹
          </button>

          <button
            type="button"
            onClick={() =>
              move(1)
            }
            style={
              navButtonStyle(
                36
              )
            }
          >
            ›
          </button>
        </div>
      )}
    </Section>
  );
}

/* =========================================================
   LOADING
========================================================= */

function LoadingBar({
  accent,
}) {
  return (
    <div
      style={{
        height: 3,

        background:
          "rgba(255,255,255,.05)",

        overflow:
          "hidden",
      }}
    >
      <div
        style={{
          width: "40%",

          height:
            "100%",

          background:
            accent,
        }}
      />
    </div>
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function FullGameOverlay({
  game,
  onClose,
  onBack,
}) {
  const overlayRef =
    useRef(null);

  const viewport =
    useViewport();

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

  const [
    gameHistory,
    setGameHistory,
  ] = useState([]);

  const portrait =
    viewport.height >=
    viewport.width;

  const desktop =
    viewport.width >=
    1100;

  useEffect(() => {
    setActiveGame(game);

    setMasterGame(null);

    setLoadError(null);

    setGameHistory([]);
  }, [game?.id]);

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
          !response.ok ||
          !data?.ok ||
          !data?.game
        ) {
          throw new Error(
            data?.error ||
              "No se pudo cargar la ficha completa."
          );
        }

        if (alive) {
          setMasterGame(
            data.game
          );
        }
      } catch (error) {
        if (
          error?.name ===
          "AbortError"
        ) {
          return;
        }

        if (alive) {
          setLoadError(
            error instanceof
              Error
              ? error.message
              : "No se pudo cargar la ficha completa."
          );
        }
      } finally {
        if (alive) {
          setLoading(
            false
          );
        }
      }
    }

    loadGame();

    return () => {
      alive = false;

      controller.abort();
    };
  }, [activeGame?.id]);

  const displayGame =
    masterGame &&
    Number(
      masterGame.id
    ) ===
      Number(
        activeGame?.id
      )
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

  const description =
    displayGame?.editorialSummary ||
    displayGame?.summary ||
    null;

  const storyline =
    displayGame?.storyline ||
    null;

  const scrollTop = () => {
    requestAnimationFrame(() => {
      overlayRef.current?.scrollTo(
        {
          top: 0,

          behavior:
            "auto",
        }
      );
    });
  };

  const openSimilarGame =
    (similar) => {
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

      scrollTop();
    };

  const goBack = () => {
    if (
      gameHistory.length >
      0
    ) {
      const previous =
        gameHistory[
          gameHistory.length -
            1
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

      scrollTop();

      return;
    }

    onBack?.();
  };

  useEffect(() => {
    const previous =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previous;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown =
      (event) => {
        if (
          event.key !==
          "Escape"
        ) {
          return;
        }

        event.preventDefault();

        event.stopPropagation();

        goBack();
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
  });

  useEffect(() => {
    return () => {
      window.dispatchEvent(
        new CustomEvent(
          MEDIA_END_EVENT
        )
      );
    };
  }, []);

  if (!activeGame?.id) {
    return null;
  }

  const landscapeMediaHeight =
    portrait
      ? undefined
      : Math.min(
          desktop
            ? 360
            : 300,

          Math.max(
            220,
            viewport.height *
              0.66
          )
        );

  return (
    <div
      ref={overlayRef}
      style={{
        position:
          "fixed",

        inset: 0,

        zIndex: 300000,

        width: "100%",

        height:
          viewport.height,

        overflowY:
          "auto",

        overflowX:
          "hidden",

        WebkitOverflowScrolling:
          "touch",

        background:
          "#080a0d",

        color:
          "#ffffff",

        fontFamily:
          "system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      }}
    >
      <header
        style={{
          position:
            "sticky",

          top: 0,

          zIndex: 40,

          display:
            "flex",

          alignItems:
            "center",

          gap: 9,

          minHeight:
            portrait
              ? 58
              : 48,

          padding:
            portrait
              ? "8px 10px"
              : "4px 10px",

          boxSizing:
            "border-box",

          borderBottom:
            `1px solid ${accent}33`,

          background:
            "rgba(5,7,9,.98)",

          backdropFilter:
            "blur(18px)",

          WebkitBackdropFilter:
            "blur(18px)",
        }}
      >
        <button
          type="button"
          aria-label="Volver"
          onClick={goBack}
          style={
            navButtonStyle()
          }
        >
          ‹
        </button>

        {cover && (
          <img
            src={cover}
            alt=""
            style={{
              width: 38,

              height: 50,

              objectFit:
                "cover",

              borderRadius:
                6,
            }}
          />
        )}

        <div
          style={{
            minWidth: 0,

            flex: 1,
          }}
        >
          <div
            style={{
              overflow:
                "hidden",

              textOverflow:
                "ellipsis",

              whiteSpace:
                "nowrap",

              fontSize:
                15,

              fontWeight:
                850,
            }}
          >
            {title}
          </div>

          <div
            style={{
              marginTop: 2,

              overflow:
                "hidden",

              textOverflow:
                "ellipsis",

              whiteSpace:
                "nowrap",

              color:
                "#858f95",

              fontSize: 9,
            }}
          >
            {[
              displayGame?.developer,
              year,
            ]
              .filter(Boolean)
              .join(" · ")}
          </div>
        </div>

        <button
          type="button"
          aria-label="Cerrar ficha"
          onClick={
            onClose
          }
          style={
            navButtonStyle()
          }
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

          maxWidth:
            portrait
              ? 1280
              : 1500,

          margin:
            "0 auto",

          padding:
            portrait
              ? "12px 10px 44px"
              : "8px 10px 30px",

          boxSizing:
            "border-box",
        }}
      >
        {loadError && (
          <div
            style={{
              marginBottom:
                10,

              padding: 10,

              borderRadius:
                10,

              background:
                "rgba(120,20,20,.13)",

              color:
                "#d9a1a1",

              fontSize:
                10,
            }}
          >
            No se pudo cargar
            toda la información
            de esta ficha. Se
            muestran los datos
            disponibles.
          </div>
        )}

        {portrait ? (
          <>
            <div
              style={{
                display:
                  "grid",

                gridTemplateColumns:
                  cover
                    ? "145px minmax(0,1fr)"
                    : "1fr",

                gap: 11,

                alignItems:
                  "start",
              }}
            >
              {cover && (
                <div
                  style={{
                    overflow:
                      "hidden",

                    borderRadius:
                      14,

                    background:
                      "#101318",
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

              <div
                style={{
                  minWidth: 0,
                }}
              >
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
              </div>
            </div>

            <div
              style={{
                marginTop:
                  11,
              }}
            >
              <Section title="Vídeo">
                <VideoPlayer
                  game={
                    displayGame
                  }
                />
              </Section>
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                display:
                  "grid",

                gridTemplateColumns:
                  cover
                    ? "minmax(170px,24%) minmax(0,1fr)"
                    : "1fr",

                gap: 10,

                width:
                  "100%",

                height:
                  landscapeMediaHeight,

                minHeight:
                  220,

                maxHeight:
                  desktop
                    ? 360
                    : 300,

                alignItems:
                  "stretch",
              }}
            >
              {cover && (
                <div
                  style={{
                    height:
                      "100%",

                    overflow:
                      "hidden",

                    borderRadius:
                      14,

                    background:
                      "#101318",
                  }}
                >
                  <img
                    src={cover}
                    alt={title}
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
                </div>
              )}

              <VideoPlayer
                game={
                  displayGame
                }
                fillHeight
              />
            </div>

            <div
              style={{
                display:
                  "grid",

                gridTemplateColumns:
                  "repeat(3,minmax(0,1fr))",

                gap: 6,

                marginTop: 8,

                padding:
                  "7px 9px",

                borderRadius:
                  12,

                background:
                  "#101318",
              }}
            >
              <HeroData
                label="Año"
                value={year}
              />

              <HeroData
                label="Desarrollador"
                value={
                  displayGame?.developer
                }
              />

              <HeroData
                label="Distribuidor"
                value={
                  displayGame?.publisher
                }
              />
            </div>
          </>
        )}

        <div
          style={{
            marginTop: 9,
          }}
        >
          <ScoreStrip
            official={
              official
            }
            community={
              community
            }
            accent={accent}
          />
        </div>

        {platforms.length >
          0 && (
          <div
            style={{
              marginTop: 8,

              display:
                "flex",

              gap: 6,

              overflowX:
                "auto",

              padding:
                "2px 1px 5px",

              scrollbarWidth:
                "none",

              WebkitOverflowScrolling:
                "touch",
            }}
          >
            {platforms.map(
              (platform) => (
                <div
                  key={
                    platform
                  }
                  style={{
                    flex:
                      "0 0 auto",
                  }}
                >
                  <Chip
                    accent={
                      accent
                    }
                  >
                    {platform}
                  </Chip>
                </div>
              )
            )}
          </div>
        )}

        {description && (
          <div
            style={{
              marginTop: 11,
            }}
          >
            <Section title="Descripción">
              <CollapsibleText
                lines={4}
                accent={
                  accent
                }
              >
                {description}
              </CollapsibleText>
            </Section>
          </div>
        )}

        <div
          style={{
            marginTop: 11,
          }}
        >
          <Gallery
            game={
              displayGame
            }
          />
        </div>

        <div
          style={{
            display: "grid",

            gridTemplateColumns:
              portrait
                ? "1fr"
                : "minmax(0,1fr) minmax(0,1fr)",

            alignItems:
              "start",

            gap: 10,

            marginTop: 11,
          }}
        >
          <Section
            title="Ficha técnica"
            compact
          >
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
              label="Motor"
              value={
                engines.join(
                  " · "
                )
              }
            />
          </Section>

          <Features
            genres={genres}
            themes={themes}
            gameModes={
              gameModes
            }
            perspectives={
              perspectives
            }
            accent={accent}
          />
        </div>

        <div
          style={{
            marginTop: 11,
          }}
        >
          <Titles
            game={
              displayGame
            }
            accent={accent}
            portrait={
              portrait
            }
          />
        </div>

        <div
          style={{
            marginTop: 11,
          }}
        >
          <Languages
            game={
              displayGame
            }
            accent={accent}
          />
        </div>

        <div
          style={{
            marginTop: 11,
          }}
        >
          <AgeRatings
            game={
              displayGame
            }
            accent={accent}
            portrait={
              portrait
            }
          />
        </div>

        {storyline && (
          <div
            style={{
              marginTop: 11,
            }}
          >
            <Section title="Historia">
              <CollapsibleText
                lines={4}
                accent={
                  accent
                }
              >
                {storyline}
              </CollapsibleText>
            </Section>
          </div>
        )}

        <div
          style={{
            marginTop: 11,
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
      </main>
    </div>
  );
}
