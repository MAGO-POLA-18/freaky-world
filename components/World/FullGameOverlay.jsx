"use client";

import {
  useEffect,
  useMemo,
  useRef,
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

function unique(items) {
  return [
    ...new Set(
      items.filter(Boolean)
    ),
  ];
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
        official > 10
          ? official / 10
          : official,

      votes:
        Number(
          game?.freakyOfficialVotes
        ) || 0,

      source:
        "official",
    };
  }

  const totalRating =
    Number(
      game?.totalRating
    );

  if (
    Number.isFinite(
      totalRating
    ) &&
    totalRating > 0
  ) {
    return {
      value:
        totalRating > 10
          ? totalRating / 10
          : totalRating,

      votes:
        Number(
          game?.totalRatingCount
        ) || 0,

      source:
        "igdb",
    };
  }

  const rating =
    Number(
      game?.rating
    );

  if (
    Number.isFinite(
      rating
    ) &&
    rating > 0
  ) {
    return {
      value:
        rating > 10
          ? rating / 10
          : rating,

      votes:
        Number(
          game?.ratingCount
        ) || 0,

      source:
        "igdb",
    };
  }

  return {
    value: null,
    votes: 0,
    source: null,
  };
}

function getCommunityScore(
  game
) {
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

function normalizeNamedItems(
  items
) {
  return asArray(items)
    .map((item) =>
      typeof item ===
      "string"
        ? item
        : item?.name ||
          item?.title ||
          item?.abbreviation
    )
    .filter(Boolean);
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
    game?.manualTrailer
      ?.youtubeId ||
    game?.manualTrailerYoutubeId;

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
   CLASIFICACIONES
========================================================= */

function normalizeRatingText(
  value
) {
  return String(
    value || ""
  )
    .trim()
    .toLowerCase()
    .replace(
      /[_-]+/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    );
}

function commonsImage(
  filename
) {
  return (
    "https://commons.wikimedia.org/wiki/Special:Redirect/file/" +
    encodeURIComponent(
      filename
    )
  );
}

function getAgeRatingBadgeUrl(
  rating
) {
  const organization =
    normalizeRatingText(
      rating?.organization
    );

  const value =
    normalizeRatingText(
      rating?.rating
    );

  /* PEGI */

  if (
    organization.includes(
      "pegi"
    )
  ) {
    const age =
      value.match(
        /\b(3|7|12|16|18)\b/
      )?.[1];

    if (age) {
      return commonsImage(
        `PEGI ${age}.svg`
      );
    }
  }

  /* ESRB */

  if (
    organization.includes(
      "esrb"
    ) ||
    organization.includes(
      "entertainment software rating"
    )
  ) {
    if (
      value.includes(
        "adults only"
      ) ||
      value === "ao"
    ) {
      return commonsImage(
        "ESRB 2013 Adults Only 18+.svg"
      );
    }

    if (
      value.includes(
        "mature"
      ) ||
      value === "m"
    ) {
      return commonsImage(
        "ESRB 2013 Mature.svg"
      );
    }

    if (
      value.includes(
        "teen"
      ) ||
      value === "t"
    ) {
      return commonsImage(
        "ESRB 2013 Teen.svg"
      );
    }

    if (
      value.includes(
        "everyone 10"
      ) ||
      value === "e10+" ||
      value === "e10"
    ) {
      return commonsImage(
        "ESRB 2013 Everyone 10+.svg"
      );
    }

    if (
      value.includes(
        "everyone"
      ) ||
      value === "e"
    ) {
      return commonsImage(
        "ESRB 2013 Everyone.svg"
      );
    }
  }

  /* CERO */

  if (
    organization.includes(
      "cero"
    ) ||
    organization.includes(
      "computer entertainment rating"
    )
  ) {
    const letter =
      value
        .toUpperCase()
        .match(
          /\b(A|B|C|D|Z)\b/
        )?.[1];

    if (letter) {
      return commonsImage(
        `CERO ${letter}.svg`
      );
    }
  }

  /* USK */

  if (
    organization.includes(
      "usk"
    ) ||
    organization.includes(
      "unterhaltungssoftware"
    )
  ) {
    const age =
      value.match(
        /\b(0|6|12|16|18)\b/
      )?.[1];

    if (age) {
      return commonsImage(
        `USK ${age}.svg`
      );
    }
  }

  return null;
}

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
   ESTILOS BASE
========================================================= */

function navButtonStyle() {
  return {
    width: 40,
    height: 40,

    flex:
      "0 0 auto",

    display:
      "grid",

    placeItems:
      "center",

    padding: 0,

    border:
      "1px solid rgba(255,255,255,.15)",

    borderRadius:
      "50%",

    background:
      "rgba(15,19,24,.96)",

    color:
      "#ffffff",

    fontSize:
      24,

    lineHeight: 1,

    cursor:
      "pointer",

    touchAction:
      "manipulation",
  };
}

function expandButtonStyle() {
  return {
    marginTop: 9,

    padding: 0,

    border: 0,

    background:
      "transparent",

    color:
      "#8bdff5",

    fontSize: 9,

    fontWeight: 900,

    cursor:
      "pointer",

    touchAction:
      "manipulation",
  };
}

/* =========================================================
   SECTION
========================================================= */

function Section({
  title,
  children,
  style,
}) {
  return (
    <section
      style={{
        padding: 14,

        border:
          "1px solid rgba(255,255,255,.075)",

        borderRadius: 16,

        background:
          "rgba(17,20,25,.96)",

        ...style,
      }}
    >
      {title && (
        <h2
          style={{
            margin:
              "0 0 11px",

            color:
              "#f4f6f7",

            fontSize: 14,

            lineHeight: 1.2,

            fontWeight: 850,
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
}) {
  return (
    <span
      style={{
        display:
          "inline-flex",

        alignItems:
          "center",

        minHeight: 25,

        padding:
          "4px 8px",

        border:
          `1px solid ${accent}38`,

        borderRadius: 999,

        background:
          `${accent}10`,

        color:
          "#dbe2e6",

        fontSize: 9,

        fontWeight: 750,

        whiteSpace:
          "nowrap",
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

        display:
          "grid",

        gridTemplateColumns:
          "auto minmax(0,1fr)",

        alignItems:
          "center",

        gap: 8,

        padding:
          "9px 10px",

        border:
          "1px solid rgba(255,255,255,.075)",

        borderRadius: 12,

        background:
          "#0d1014",
      }}
    >
      <div
        style={{
          width: 30,

          height: 30,

          display:
            "grid",

          placeItems:
            "center",

          flex:
            "0 0 auto",

          borderRadius:
            "50%",

          background:
            "rgba(255,255,255,.055)",

          fontSize: 17,

          lineHeight: 1,
        }}
      >
        {icon}
      </div>

      <div
        style={{
          minWidth: 0,
        }}
      >
        <div
          style={{
            color:
              "#7d878e",

            fontSize: 7,

            fontWeight: 850,

            textTransform:
              "uppercase",

            letterSpacing:
              ".05em",

            whiteSpace:
              "nowrap",
          }}
        >
          {label}
        </div>

        <div
          style={{
            marginTop: 3,

            color:
              accent ||
              "#ffffff",

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
        display:
          "grid",

        gridTemplateColumns:
          "repeat(3,minmax(0,1fr))",

        gap: 6,

        width:
          "100%",
      }}
    >
      <ScoreBox
        icon="🏅"
        label="Oficial"
        value={
          formatScore(
            official?.value
          )
        }
        accent={
          accent
        }
      />

      <ScoreBox
        icon="⭐"
        label="Comunidad"
        value={
          formatScore(
            community?.value
          )
        }
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
   HERO DATA
========================================================= */

function HeroData({
  label,
  value,
}) {
  return (
    <div
      style={{
        minWidth: 0,
      }}
    >
      <div
        style={{
          color:
            "#727c83",

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

          overflow:
            "hidden",

          textOverflow:
            "ellipsis",

          whiteSpace:
            "nowrap",

          color:
            "#dce1e4",

          fontSize: 9,

          fontWeight: 750,
        }}
      >
        {value || "—"}
      </div>
    </div>
  );
}

/* =========================================================
   DATA ROW
========================================================= */

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
        display:
          "grid",

        gridTemplateColumns:
          "100px minmax(0,1fr)",

        gap: 8,

        padding:
          "7px 0",

        borderBottom:
          "1px solid rgba(255,255,255,.05)",
      }}
    >
      <div
        style={{
          color:
            "#747f86",

          fontSize: 9,

          fontWeight: 750,
        }}
      >
        {label}
      </div>

      <div
        style={{
          minWidth: 0,

          color:
            "#d3d9dc",

          fontSize: 10,

          lineHeight: 1.35,
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* =========================================================
   TEXTO COLAPSABLE
========================================================= */

function CollapsibleText({
  children,
  lines = 4,
  accent = "#5fdcff",
}) {
  const [
    expanded,
    setExpanded,
  ] = useState(false);

  if (!children) {
    return null;
  }

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

          overflow:
            "hidden",

          color:
            "#bdc5ca",

          fontSize: 12,

          lineHeight: 1.58,

          whiteSpace:
            "pre-line",
        }}
      >
        {children}
      </div>

      <button
        type="button"
        onClick={() =>
          setExpanded(
            (current) =>
              !current
          )
        }
        style={{
          marginTop: 8,

          padding: 0,

          border: 0,

          background:
            "transparent",

          color:
            accent,

          fontSize: 9,

          fontWeight: 900,

          cursor:
            "pointer",
        }}
      >
        {expanded
          ? "VER MENOS"
          : "VER MÁS"}
      </button>
    </div>
  );
}

/* =========================================================
   VIDEO
========================================================= */
function VideoPlayer({
  game,
  fillHeight = false,
}) {
  const videos =
    useMemo(() => {
      const ids =
        asArray(
          game?.videos
        )
          .map(
            getYoutubeId
          )
          .filter(Boolean);

      return unique([
        chooseFirstVideo(
          game
        ),
        ...ids,
      ]);
    }, [
      game,
    ]);

  const [
    activeIndex,
    setActiveIndex,
  ] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [
    game?.id,
  ]);

  if (
    !videos.length
  ) {
    return (
      <div
        style={{
          width:
            "100%",

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

          display:
            "grid",

          placeItems:
            "center",

          borderRadius: 14,

          overflow:
            "hidden",

          background:
            "#0c0f13",

          color:
            "#68727a",

          fontSize: 10,
        }}
      >
        Sin vídeo disponible
      </div>
    );
  }

  const safeIndex =
    Math.min(
      activeIndex,
      videos.length - 1
    );

  const videoId =
    videos[
      safeIndex
    ];

  function previousVideo() {
    setActiveIndex(
      (current) =>
        (
          current -
          1 +
          videos.length
        ) %
        videos.length
    );
  }

  function nextVideo() {
    setActiveIndex(
      (current) =>
        (
          current +
          1
        ) %
        videos.length
    );
  }

  const arrowStyle = {
    position:
      "absolute",

    top:
      "50%",

    transform:
      "translateY(-50%)",

    zIndex: 8,

    width: 38,

    height: 38,

    display:
      "grid",

    placeItems:
      "center",

    padding: 0,

    border:
      "1px solid rgba(255,255,255,.32)",

    borderRadius:
      "50%",

    background:
      "rgba(0,0,0,.58)",

    color:
      "#ffffff",

    fontSize: 28,

    lineHeight: 1,

    cursor:
      "pointer",

    touchAction:
      "manipulation",

    backdropFilter:
      "blur(4px)",

    WebkitBackdropFilter:
      "blur(4px)",
  };

  return (
    <div
      style={{
        width:
          "100%",

        height:
          fillHeight
            ? "100%"
            : "auto",

        minWidth: 0,
      }}
    >
      <div
        style={{
          position:
            "relative",

          width:
            "100%",

          height:
            fillHeight
              ? "100%"
              : "auto",

          minHeight: 0,

          aspectRatio:
            fillHeight
              ? undefined
              : "16 / 9",

          overflow:
            "hidden",

          borderRadius: 14,

          background:
            "#000",
        }}
      >
        <iframe
          key={
            videoId
          }
          src={`https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0`}
          title={`${getTitle(
            game
          )} — vídeo`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{
            position:
              "absolute",

            inset: 0,

            width:
              "100%",

            height:
              "100%",

            border: 0,
          }}
        />

        {videos.length >
          1 && (
          <>
            <button
              type="button"
              aria-label="Vídeo anterior"
              onClick={
                previousVideo
              }
              style={{
                ...arrowStyle,

                left: 10,
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

                right: 10,
              }}
            >
              ›
            </button>

            <div
              style={{
                position:
                  "absolute",

                left: 10,

                bottom: 10,

                zIndex: 8,

                padding:
                  "5px 9px",

                borderRadius:
                  999,

                background:
                  "rgba(0,0,0,.72)",

                color:
                  "#ffffff",

                fontSize: 9,

                fontWeight: 850,

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
    }, [
      game,
    ]);

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

  if (
    !images.length
  ) {
    return null;
  }

  function move(
    direction
  ) {
    scrollRef.current
      ?.scrollBy({
        left:
          direction *
          Math.max(
            240,
            scrollRef.current
              .clientWidth *
              0.8
          ),

        behavior:
          "smooth",
      });
  }

  function openImage(index) {
    setActiveIndex(index);
    setFullscreen(true);
  }

  function previous() {
    setActiveIndex(
      (current) =>
        (
          current -
          1 +
          images.length
        ) %
        images.length
    );
  }

  function next() {
    setActiveIndex(
      (current) =>
        (
          current +
          1
        ) %
        images.length
    );
  }

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
              display:
                "flex",

              gap: 9,

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
                  navButtonStyle()
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
                  navButtonStyle()
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
            setFullscreen(false)
          }
          style={{
            position:
              "fixed",

            inset: 0,

            zIndex:
              400000,

            display:
              "grid",

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
              setFullscreen(false)
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

                  top:
                    "50%",

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

                  top:
                    "50%",

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

              width:
                "auto",

              height:
                "auto",

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

              fontWeight: 800,
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
   META GROUP
========================================================= */

function MetaGroup({
  label,
  values,
  accent,
}) {
  if (
    !values?.length
  ) {
    return null;
  }

  return (
    <div
      style={{
        paddingBottom: 10,

        marginBottom: 10,

        borderBottom:
          "1px solid rgba(255,255,255,.05)",
      }}
    >
      <div
        style={{
          marginBottom: 6,

          color:
            "#747f86",

          fontSize: 8,

          fontWeight: 850,

          textTransform:
            "uppercase",
        }}
      >
        {label}
      </div>

      <div
        style={{
          display:
            "flex",

          flexWrap:
            "wrap",

          gap: 5,
        }}
      >
        {values.map(
          (value) => (
            <Chip
              key={value}
              accent={accent}
            >
              {value}
            </Chip>
          )
        )}
      </div>
    </div>
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

  const [
    expanded,
    setExpanded,
  ] = useState(false);

  if (
    !languages.length
  ) {
    return null;
  }

  const visible =
    expanded
      ? languages
      : languages.slice(
          0,
          4
        );

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
            width:
              "100%",

            minWidth: 320,

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
                        "6px 5px",

                      color:
                        "#758087",

                      fontSize: 8,

                      textAlign:
                        label ===
                        "Idioma"
                          ? "left"
                          : "center",
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
                        "7px 5px",

                      color:
                        "#cbd1d5",

                      fontSize: 10,
                    }}
                  >
                    {language?.name ||
                      language?.languageName ||
                      language?.nativeName ||
                      "Idioma"}
                  </td>

                  <td
                    style={{
                      textAlign:
                        "center",

                      color:
                        "#cbd1d5",
                    }}
                  >
                    {language?.audio
                      ? "✓"
                      : "—"}
                  </td>

                  <td
                    style={{
                      textAlign:
                        "center",

                      color:
                        "#cbd1d5",
                    }}
                  >
                    {language?.subtitles
                      ? "✓"
                      : "—"}
                  </td>

                  <td
                    style={{
                      textAlign:
                        "center",

                      color:
                        "#cbd1d5",
                    }}
                  >
                    {language?.interface
                      ? "✓"
                      : "—"}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {languages.length >
        4 && (
        <button
          type="button"
          onClick={() =>
            setExpanded(
              (current) =>
                !current
            )
          }
          style={
            expandButtonStyle()
          }
        >
          {expanded
            ? "VER MENOS"
            : `VER MÁS (${languages.length - 4})`}
        </button>
      )}
    </Section>
  );
}

/* =========================================================
   SELLO DE CLASIFICACIÓN
========================================================= */

function AgeRatingBadge({
  rating,
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
          setImageError(true)
        }
        style={{
          width: 72,

          height: 82,

          objectFit:
            "contain",

          display:
            "block",

          flex:
            "0 0 auto",
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: 72,

        minHeight: 72,

        display:
          "grid",

        placeItems:
          "center",

        padding: 7,

        boxSizing:
          "border-box",

        border:
          "1px solid rgba(255,255,255,.14)",

        borderRadius: 10,

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

            fontWeight: 850,

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

            fontSize: 18,

            lineHeight: 1,

            fontWeight: 950,
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
}) {
  const ratings =
    asArray(
      game?.ageRatings
    );

  if (
    !ratings.length
  ) {
    return null;
  }

  return (
    <Section title="Clasificación">
      <div
        style={{
          display:
            "grid",

          gridTemplateColumns:
            "repeat(auto-fit,minmax(190px,1fr))",

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
                rating?.id ||
                `${rating?.organization}-${rating?.rating}-${index}`
              }
              style={{
                display:
                  "flex",

                alignItems:
                  "flex-start",

                gap: 10,

                padding: 10,

                border:
                  `1px solid ${accent}22`,

                borderRadius:
                  12,

                background:
                  "#12161c",
              }}
            >
              <AgeRatingBadge
                rating={rating}
              />

              <div
                style={{
                  minWidth: 0,

                  flex: 1,
                }}
              >
                <div
                  style={{
                    color:
                      "#8a949a",

                    fontSize: 8,

                    fontWeight: 850,

                    textTransform:
                      "uppercase",
                  }}
                >
                  {rating?.organization ||
                    "Clasificación"}
                </div>

                <div
                  style={{
                    marginTop: 4,

                    color:
                      "#ffffff",

                    fontSize: 16,

                    fontWeight: 950,
                  }}
                >
                  {rating?.rating ||
                    "—"}
                </div>

                {asArray(
                  rating?.contentDescriptors ||
                    rating?.descriptors
                ).length >
                  0 && (
                  <div
                    style={{
                      display:
                        "flex",

                      flexWrap:
                        "wrap",

                      gap: 4,

                      marginTop: 7,
                    }}
                  >
                    {asArray(
                      rating?.contentDescriptors ||
                        rating?.descriptors
                    ).map(
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
                              "3px 5px",

                            borderRadius:
                              6,

                            background:
                              "rgba(255,255,255,.055)",

                            color:
                              "#a9b1b6",

                            fontSize: 7,
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

                {rating?.synopsis &&
                  rating.synopsis !==
                    "No Rating Summary" && (
                    <div
                      style={{
                        marginTop: 7,
                      }}
                    >
                      <CollapsibleText
                        lines={3}
                        accent={
                          accent
                        }
                      >
                        {
                          rating.synopsis
                        }
                      </CollapsibleText>
                    </div>
                  )}
              </div>
            </div>
          )
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

  if (
    !similar.length
  ) {
    return null;
  }

  function move(direction) {
    scrollRef.current
      ?.scrollBy({
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
  }

  return (
    <Section title="Juegos similares">
      <div
        ref={scrollRef}
        style={{
          display:
            "flex",

          gap: 10,

          overflowX:
            "auto",

          paddingBottom: 4,

          WebkitOverflowScrolling:
            "touch",

          scrollbarWidth:
            "none",
        }}
      >
        {similar.map(
          (item) => {
            const cover =
              getCover(item);

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
                      src={cover}
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
                      minHeight: 30,

                      fontSize: 10,

                      lineHeight: 1.35,

                      fontWeight: 800,
                    }}
                  >
                    {item.name}
                  </div>

                  <div
                    style={{
                      marginTop: 4,

                      color:
                        accent,

                      fontSize: 8,
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
              navButtonStyle()
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
              navButtonStyle()
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

  const [
    viewport,
    setViewport,
  ] = useState(
    getViewport
  );

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

  useEffect(() => {
    function updateViewport() {
      setViewport(
        getViewport()
      );
    }

    updateViewport();

    window.addEventListener(
      "resize",
      updateViewport
    );

    window.addEventListener(
      "orientationchange",
      updateViewport
    );

    window.visualViewport
      ?.addEventListener(
        "resize",
        updateViewport
      );

    return () => {
      window.removeEventListener(
        "resize",
        updateViewport
      );

      window.removeEventListener(
        "orientationchange",
        updateViewport
      );

      window.visualViewport
        ?.removeEventListener(
          "resize",
          updateViewport
        );
    };
  }, []);

  const portrait =
    viewport.height >=
    viewport.width;

  useEffect(() => {
    setActiveGame(game);
    setMasterGame(null);
    setLoadError(null);
    setGameHistory([]);
  }, [
    game?.id,
  ]);

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
          setLoading(false);
        }
      }
    }

    loadGame();

    return () => {
      alive = false;
      controller.abort();
    };
  }, [
    activeGame?.id,
  ]);

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
    getTitle(
      displayGame
    );

  const cover =
    getCover(
      displayGame
    );

  const year =
    getYear(
      displayGame
    );

  const official =
    getScore(
      displayGame
    );

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
      displayGame
        ?.playerPerspectives
    );

  const engines =
    normalizeNamedItems(
      displayGame?.gameEngines
    );

  const description =
    displayGame
      ?.editorialSummary ||
    displayGame?.summary ||
    null;

  const storyline =
    displayGame?.storyline ||
    null;

  const alternativeNames =
    asArray(
      displayGame
        ?.alternativeNames
    )
      .map(
        (item) =>
          typeof item ===
          "string"
            ? item
            : item?.name
      )
      .filter(Boolean);

  function scrollTop() {
    requestAnimationFrame(
      () => {
        overlayRef.current
          ?.scrollTo({
            top: 0,
            behavior:
              "auto",
          });
      }
    );
  }

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

    scrollTop();
  }

  function goBack() {
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
      setActiveGame(previous);
      scrollTop();

      return;
    }

    onBack?.();
  }

  useEffect(() => {
    const previous =
      document.body.style
        .overflow;

    document.body.style
      .overflow =
      "hidden";

    return () => {
      document.body.style
        .overflow =
        previous;
    };
  }, []);

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

      event.preventDefault();
      event.stopPropagation();
      goBack();
    }

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
          "tierra-vicio-media-end"
        )
      );
    };
  }, []);

  if (
    !activeGame?.id
  ) {
    return null;
  }

  const landscapeMediaHeight =
    portrait
      ? undefined
      : Math.min(
          300,
          Math.max(
            225,
            viewport.height *
              0.68
          )
        );

  return (
    <div
      ref={overlayRef}
      style={{
        position:
          "fixed",

        inset: 0,

        zIndex:
          300000,

        width:
          "100%",

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

          gap:
            portrait
              ? 10
              : 8,

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
          onClick={
            goBack
          }
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
              width:
                portrait
                  ? 38
                  : 34,

              height:
                portrait
                  ? 50
                  : 45,

              objectFit:
                "cover",

              borderRadius: 6,
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
                portrait
                  ? 15
                  : 14,

              fontWeight: 850,
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
              displayGame
                ?.developer,
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
          width:
            "100%",

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
              marginBottom: 10,

              padding: 10,

              borderRadius: 10,

              background:
                "rgba(120,20,20,.13)",

              color:
                "#d9a1a1",

              fontSize: 10,
            }}
          >
            No se pudo cargar toda la información de esta ficha. Se muestran los datos disponibles.
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

                    borderRadius: 14,

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
                    displayGame
                      ?.developer
                  }
                />

                <DataRow
                  label="Distribuidor"
                  value={
                    displayGame
                      ?.publisher
                  }
                />
              </div>
            </div>

            <div
              style={{
                marginTop: 11,
              }}
            >
              <Section
                title="Vídeo"
              >
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
                    ? "minmax(185px,24%) minmax(0,1fr)"
                    : "1fr",

                gap: 10,

                width:
                  "100%",

                height:
                  landscapeMediaHeight,

                minHeight: 225,

                maxHeight: 300,

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

                    borderRadius: 14,

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

                borderRadius: 12,

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
                  displayGame
                    ?.developer
                }
              />

              <HeroData
                label="Distribuidor"
                value={
                  displayGame
                    ?.publisher
                }
              />
            </div>
          </>
        )}

        {/* ===================================================
            PUNTUACIONES
        =================================================== */}

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
            accent={
              accent
            }
          />
        </div>

        {/* ===================================================
            PLATAFORMAS
        =================================================== */}

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

        {/* ===================================================
            DESCRIPCIÓN
        =================================================== */}

        {description && (
          <div
            style={{
              marginTop: 11,
            }}
          >
            <Section title="Descripción">
              <CollapsibleText
                lines={4}
                accent={accent}
              >
                {description}
              </CollapsibleText>
            </Section>
          </div>
        )}

        {/* ===================================================
            GALERÍA
        =================================================== */}

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

        {/* ===================================================
            FICHA TÉCNICA + CARACTERÍSTICAS
        =================================================== */}

        <div
          style={{
            display:
              "grid",

            gridTemplateColumns:
              portrait
                ? "1fr"
                : "1fr 1fr",

            gap: 10,

            marginTop: 11,
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
                displayGame
                  ?.developer
              }
            />

            <DataRow
              label="Distribuidor"
              value={
                displayGame
                  ?.publisher
              }
            />

            <DataRow
              label="Saga"
              value={
                typeof displayGame
                  ?.collection ===
                "string"
                  ? displayGame
                      .collection
                  : displayGame
                      ?.collection
                      ?.name ||
                    displayGame
                      ?.collectionName
              }
            />

            <DataRow
              label="Franquicia"
              value={
                typeof displayGame
                  ?.franchise ===
                "string"
                  ? displayGame
                      .franchise
                  : displayGame
                      ?.franchise
                      ?.name ||
                    displayGame
                      ?.franchiseName
              }
            />

            <DataRow
              label="Tipo"
              value={
                displayGame
                  ?.releaseType
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

            <DataRow
              label="Otros títulos"
              value={
                alternativeNames.join(
                  " · "
                )
              }
            />
          </Section>

          <Section title="Características">
            <MetaGroup
              label="Géneros"
              values={
                genres
              }
              accent="#58d68d"
            />

            <MetaGroup
              label="Temas"
              values={
                themes
              }
              accent="#f0b35a"
            />

            <MetaGroup
              label="Modos de juego"
              values={
                gameModes
              }
              accent="#9c8cff"
            />

            <MetaGroup
              label="Perspectiva"
              values={
                perspectives
              }
              accent="#5fdcff"
            />
          </Section>
        </div>

        {/* ===================================================
            IDIOMAS
        =================================================== */}

        <div
          style={{
            marginTop: 11,
          }}
        >
          <Languages
            game={
              displayGame
            }
          />
        </div>

        {/* ===================================================
            CLASIFICACIONES
        =================================================== */}

        <div
          style={{
            marginTop: 11,
          }}
        >
          <AgeRatings
            game={
              displayGame
            }
            accent={
              accent
            }
          />
        </div>

        {/* ===================================================
            HISTORIA
        =================================================== */}

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

        {/* ===================================================
            SIMILARES
        =================================================== */}

        <div
          style={{
            marginTop: 11,
          }}
        >
          <SimilarGames
            game={
              displayGame
            }
            accent={
              accent
            }
            onOpenGame={
              openSimilarGame
            }
          />
        </div>
      </main>
    </div>
  );
}
