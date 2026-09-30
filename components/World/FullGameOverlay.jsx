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

  return Number(value).toFixed(
    1
  );
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

            fontSize:
              14,

            lineHeight:
              1.2,

            fontWeight:
              850,
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
  accent = "#5fdcff",
}) {
  return (
    <span
      style={{
        display:
          "inline-flex",

        alignItems:
          "center",

        minHeight:
          25,

        padding:
          "4px 8px",

        border:
          `1px solid ${accent}38`,

        borderRadius:
          999,

        background:
          `${accent}10`,

        color:
          "#dbe2e6",

        fontSize:
          9,

        fontWeight:
          750,
      }}
    >
      {children}
    </span>
  );
}

function navButtonStyle() {
  return {
    width:
      38,

    height:
      38,

    display:
      "grid",

    placeItems:
      "center",

    padding:
      0,

    border:
      "1px solid rgba(255,255,255,.14)",

    borderRadius:
      "50%",

    background:
      "rgba(15,19,24,.94)",

    color:
      "#ffffff",

    fontSize:
      23,

    lineHeight:
      1,

    cursor:
      "pointer",

    touchAction:
      "manipulation",

    userSelect:
      "none",

    WebkitUserSelect:
      "none",
  };
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
            expanded
              ? undefined
              : "vertical",

          overflow:
            "hidden",

          color:
            "#bdc5ca",

          fontSize:
            12,

          lineHeight:
            1.58,

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
          marginTop:
            8,

          padding:
            0,

          border:
            0,

          background:
            "transparent",

          color:
            accent,

          fontSize:
            9,

          fontWeight:
            900,

          cursor:
            "pointer",

          touchAction:
            "manipulation",
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
   SCORE
========================================================= */

function ScoreBox({
  label,
  value,
  sublabel,
  accent,
  compact = false,
}) {
  return (
    <div
      style={{
        minWidth:
          0,

        padding:
          compact
            ? "8px 5px"
            : "9px 6px",

        border:
          "1px solid rgba(255,255,255,.075)",

        borderRadius:
          12,

        background:
          "#0d1014",

        textAlign:
          "center",
      }}
    >
      <div
        style={{
          color:
            "#7d878e",

          fontSize:
            7,

          fontWeight:
            850,

          textTransform:
            "uppercase",

          letterSpacing:
            ".05em",
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop:
            4,

          color:
            accent ||
            "#ffffff",

          fontSize:
            compact
              ? 18
              : 21,

          lineHeight:
            1,

          fontWeight:
            950,
        }}
      >
        {value}
      </div>

      {sublabel && (
        <div
          style={{
            marginTop:
              4,

            color:
              "#69737a",

            fontSize:
              7,
          }}
        >
          {sublabel}
        </div>
      )}
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

      const preferred =
        chooseFirstVideo(
          game
        );

      return unique([
        preferred,
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
              ? 220
              : 180,

          aspectRatio:
            fillHeight
              ? undefined
              : "16 / 9",

          display:
            "grid",

          placeItems:
            "center",

          border:
            "1px solid rgba(255,255,255,.07)",

          borderRadius:
            14,

          background:
            "#0c0f13",

          color:
            "#68727a",

          fontSize:
            10,
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

  return (
    <div
      style={{
        height:
          fillHeight
            ? "100%"
            : "auto",

        display:
          "flex",

        flexDirection:
          "column",
      }}
    >
      <div
        style={{
          position:
            "relative",

          width:
            "100%",

          flex:
            fillHeight
              ? 1
              : undefined,

          minHeight:
            fillHeight
              ? 0
              : undefined,

          aspectRatio:
            fillHeight
              ? undefined
              : "16 / 9",

          overflow:
            "hidden",

          border:
            "1px solid rgba(255,255,255,.09)",

          borderRadius:
            14,

          background:
            "#000",
        }}
      >
        <iframe
          key={
            videoId
          }
          src={`https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0`}
          title={`${getTitle(game)} — vídeo`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{
            position:
              "absolute",

            inset:
              0,

            width:
              "100%",

            height:
              "100%",

            border:
              0,
          }}
        />
      </div>

      {videos.length >
        1 && (
        <div
          style={{
            display:
              "flex",

            justifyContent:
              "center",

            alignItems:
              "center",

            gap:
              8,

            marginTop:
              7,
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
              minWidth:
                48,

              textAlign:
                "center",

              color:
                "#7f8990",

              fontSize:
                8,
            }}
          >
            {safeIndex + 1} de{" "}
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
   GALERÍA DINÁMICA
========================================================= */

function Gallery({
  game,
  portrait,
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

  const scrollRef =
    useRef(null);

  const touchStartX =
    useRef(null);

  const [
    fullscreen,
    setFullscreen,
  ] = useState(false);

  const [
    activeIndex,
    setActiveIndex,
  ] = useState(0);

  useEffect(() => {
    setFullscreen(false);
    setActiveIndex(0);
  }, [
    game?.id,
  ]);

  if (
    !images.length
  ) {
    return null;
  }

  function moveCarousel(
    direction
  ) {
    const element =
      scrollRef.current;

    if (!element) {
      return;
    }

    element.scrollBy({
      left:
        direction *
        Math.max(
          250,
          element.clientWidth *
            0.82
        ),

      behavior:
        "smooth",
    });
  }

  function previousImage() {
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

  function nextImage() {
    setActiveIndex(
      (current) =>
        (
          current +
          1
        ) %
        images.length
    );
  }

  function handleFullscreenTouchStart(
    event
  ) {
    touchStartX.current =
      event.touches?.[0]
        ?.clientX ??
      null;
  }

  function handleFullscreenTouchEnd(
    event
  ) {
    if (
      touchStartX.current ===
      null
    ) {
      return;
    }

    const endX =
      event.changedTouches
        ?.[0]?.clientX;

    if (
      typeof endX !==
      "number"
    ) {
      touchStartX.current =
        null;

      return;
    }

    const delta =
      endX -
      touchStartX.current;

    if (
      Math.abs(delta) >
      45
    ) {
      if (
        delta > 0
      ) {
        previousImage();
      } else {
        nextImage();
      }
    }

    touchStartX.current =
      null;
  }

  const groups = [];

  let cursor = 0;
  let groupIndex = 0;

  while (
    cursor <
    images.length
  ) {
    const pattern =
      groupIndex %
      4;

    const take =
      pattern === 2
        ? 4
        : 3;

    groups.push({
      pattern,
      start:
        cursor,
      images:
        images.slice(
          cursor,
          cursor + take
        ),
    });

    cursor +=
      take;

    groupIndex +=
      1;
  }

  function openImage(
    index
  ) {
    setActiveIndex(
      index
    );

    setFullscreen(
      true
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
            ref={
              scrollRef
            }
            style={{
              display:
                "flex",

              gap:
                10,

              overflowX:
                "auto",

              overflowY:
                "hidden",

              padding:
                "2px 4px 5px",

              WebkitOverflowScrolling:
                "touch",

              scrollSnapType:
                "x proximity",

              scrollbarWidth:
                "none",
            }}
          >
            {groups.map(
              (
                group,
                index
              ) => (
                <GalleryGroup
                  key={
                    `${group.start}-${index}`
                  }
                  group={
                    group
                  }
                  portrait={
                    portrait
                  }
                  onOpen={
                    openImage
                  }
                />
              )
            )}
          </div>

          {images.length >
            1 && (
            <>
              <button
                type="button"
                aria-label="Galería anterior"
                onClick={() =>
                  moveCarousel(
                    -1
                  )
                }
                style={{
                  ...navButtonStyle(),

                  position:
                    "absolute",

                  left:
                    5,

                  top:
                    "50%",

                  transform:
                    "translateY(-50%)",

                  zIndex:
                    5,

                  background:
                    "rgba(5,7,9,.82)",
                }}
              >
                ‹
              </button>

              <button
                type="button"
                aria-label="Galería siguiente"
                onClick={() =>
                  moveCarousel(
                    1
                  )
                }
                style={{
                  ...navButtonStyle(),

                  position:
                    "absolute",

                  right:
                    5,

                  top:
                    "50%",

                  transform:
                    "translateY(-50%)",

                  zIndex:
                    5,

                  background:
                    "rgba(5,7,9,.82)",
                }}
              >
                ›
              </button>
            </>
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
          onTouchStart={
            handleFullscreenTouchStart
          }
          onTouchEnd={
            handleFullscreenTouchEnd
          }
          style={{
            position:
              "fixed",

            inset:
              0,

            zIndex:
              100010,

            display:
              "grid",

            placeItems:
              "center",

            padding:
              18,

            background:
              "rgba(0,0,0,.96)",

            touchAction:
              "pan-y",
          }}
        >
          <button
            type="button"
            aria-label="Cerrar galería"
            onClick={() =>
              setFullscreen(
                false
              )
            }
            style={{
              ...navButtonStyle(),

              position:
                "absolute",

              top:
                15,

              right:
                15,

              zIndex:
                8,
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
                  previousImage();
                }}
                style={{
                  ...navButtonStyle(),

                  position:
                    "absolute",

                  left:
                    14,

                  top:
                    "50%",

                  transform:
                    "translateY(-50%)",

                  zIndex:
                    8,
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
                  nextImage();
                }}
                style={{
                  ...navButtonStyle(),

                  position:
                    "absolute",

                  right:
                    14,

                  top:
                    "50%",

                  transform:
                    "translateY(-50%)",

                  zIndex:
                    8,
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
            draggable={
              false
            }
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

              objectFit:
                "contain",

              borderRadius:
                12,

              userSelect:
                "none",

              WebkitUserSelect:
                "none",
            }}
          />

          <div
            style={{
              position:
                "absolute",

              bottom:
                15,

              padding:
                "6px 11px",

              borderRadius:
                999,

              background:
                "rgba(0,0,0,.75)",

              fontSize:
                10,

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

function GalleryGroup({
  group,
  portrait,
  onOpen,
}) {
  const {
    pattern,
    start,
    images,
  } = group;

  const width =
    portrait
      ? 470
      : 660;

  const height =
    portrait
      ? 270
      : 300;

  if (
    images.length ===
    1
  ) {
    return (
      <div
        style={{
          flex:
            `0 0 ${width}px`,

          width,
          height,

          scrollSnapAlign:
            "start",
        }}
      >
        <GalleryTile
          image={
            images[0]
          }
          index={
            start
          }
          onOpen={
            onOpen
          }
        />
      </div>
    );
  }

  if (
    images.length ===
    2
  ) {
    return (
      <div
        style={{
          flex:
            `0 0 ${width}px`,

          width,
          height,

          display:
            "grid",

          gridTemplateColumns:
            "1fr 1fr",

          gap:
            8,

          scrollSnapAlign:
            "start",
        }}
      >
        <GalleryTile
          image={
            images[0]
          }
          index={
            start
          }
          onOpen={
            onOpen
          }
        />

        <GalleryTile
          image={
            images[1]
          }
          index={
            start + 1
          }
          onOpen={
            onOpen
          }
        />
      </div>
    );
  }

  /* =======================================================
     PATRÓN A
     Vertical + dos horizontales
  ======================================================= */

  if (
    pattern ===
    0
  ) {
    return (
      <div
        style={{
          flex:
            `0 0 ${width}px`,

          width,
          height,

          display:
            "grid",

          gridTemplateColumns:
            "0.95fr 1.45fr",

          gridTemplateRows:
            "1fr 1fr",

          gap:
            8,

          scrollSnapAlign:
            "start",
        }}
      >
        <div
          style={{
            gridRow:
              "1 / span 2",

            minWidth:
              0,

            minHeight:
              0,
          }}
        >
          <GalleryTile
            image={
              images[0]
            }
            index={
              start
            }
            onOpen={
              onOpen
            }
          />
        </div>

        <GalleryTile
          image={
            images[1]
          }
          index={
            start + 1
          }
          onOpen={
            onOpen
          }
        />

        <GalleryTile
          image={
            images[2]
          }
          index={
            start + 2
          }
          onOpen={
            onOpen
          }
        />
      </div>
    );
  }

  /* =======================================================
     PATRÓN B
     Grande arriba + dos abajo
  ======================================================= */

  if (
    pattern ===
    1
  ) {
    return (
      <div
        style={{
          flex:
            `0 0 ${width}px`,

          width,
          height,

          display:
            "grid",

          gridTemplateColumns:
            "1fr 1fr",

          gridTemplateRows:
            "1.2fr .8fr",

          gap:
            8,

          scrollSnapAlign:
            "start",
        }}
      >
        <div
          style={{
            gridColumn:
              "1 / span 2",

            minWidth:
              0,

            minHeight:
              0,
          }}
        >
          <GalleryTile
            image={
              images[0]
            }
            index={
              start
            }
            onOpen={
              onOpen
            }
          />
        </div>

        <GalleryTile
          image={
            images[1]
          }
          index={
            start + 1
          }
          onOpen={
            onOpen
          }
        />

        <GalleryTile
          image={
            images[2]
          }
          index={
            start + 2
          }
          onOpen={
            onOpen
          }
        />
      </div>
    );
  }

  /* =======================================================
     PATRÓN C
     Cuatro iguales
  ======================================================= */

  if (
    pattern ===
    2
  ) {
    return (
      <div
        style={{
          flex:
            `0 0 ${width}px`,

          width,
          height,

          display:
            "grid",

          gridTemplateColumns:
            "1fr 1fr",

          gridTemplateRows:
            "1fr 1fr",

          gap:
            8,

          scrollSnapAlign:
            "start",
        }}
      >
        {images.map(
          (
            image,
            index
          ) => (
            <GalleryTile
              key={
                `${image}-${index}`
              }
              image={
                image
              }
              index={
                start +
                index
              }
              onOpen={
                onOpen
              }
            />
          )
        )}
      </div>
    );
  }

  /* =======================================================
     PATRÓN D
     Dos horizontales izquierda + vertical derecha
  ======================================================= */

  return (
    <div
      style={{
        flex:
          `0 0 ${width}px`,

        width,
        height,

        display:
          "grid",

        gridTemplateColumns:
          "1.45fr .95fr",

        gridTemplateRows:
          "1fr 1fr",

        gap:
          8,

        scrollSnapAlign:
          "start",
      }}
    >
      <GalleryTile
        image={
          images[0]
        }
        index={
          start
        }
        onOpen={
          onOpen
        }
      />

      <div
        style={{
          gridColumn:
            2,

          gridRow:
            "1 / span 2",

          minWidth:
            0,

          minHeight:
            0,
        }}
      >
        <GalleryTile
          image={
            images[1]
          }
          index={
            start + 1
          }
          onOpen={
            onOpen
          }
        />
      </div>

      <GalleryTile
        image={
          images[2]
        }
        index={
          start + 2
        }
        onOpen={
          onOpen
        }
      />
    </div>
  );
}

function GalleryTile({
  image,
  index,
  onOpen,
}) {
  return (
    <button
      type="button"
      onClick={() =>
        onOpen?.(
          index
        )
      }
      style={{
        width:
          "100%",

        height:
          "100%",

        minWidth:
          0,

        minHeight:
          0,

        padding:
          0,

        overflow:
          "hidden",

        border:
          "1px solid rgba(255,255,255,.08)",

        borderRadius:
          12,

        background:
          "#090b0f",

        cursor:
          "pointer",

        touchAction:
          "manipulation",
      }}
    >
      <img
        src={
          image
        }
        alt=""
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
    </button>
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
          3
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

            minWidth:
              320,

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
                (
                  label
                ) => (
                  <th
                    key={
                      label
                    }
                    style={{
                      padding:
                        "6px 5px",

                      borderBottom:
                        "1px solid rgba(255,255,255,.08)",

                      color:
                        "#758087",

                      fontSize:
                        8,

                      fontWeight:
                        850,

                      textAlign:
                        label ===
                        "Idioma"
                          ? "left"
                          : "center",

                      textTransform:
                        "uppercase",
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
              ) => {
                const name =
                  language?.name ||
                  language?.languageName ||
                  language?.nativeName ||
                  "Idioma";

                return (
                  <tr
                    key={
                      language?.id ||
                      language?.languageId ||
                      `${name}-${index}`
                    }
                  >
                    <td
                      style={
                        languageCellStyle(
                          "left"
                        )
                      }
                    >
                      {name}
                    </td>

                    <td
                      style={
                        languageCellStyle()
                      }
                    >
                      {language?.audio
                        ? "✓"
                        : "—"}
                    </td>

                    <td
                      style={
                        languageCellStyle()
                      }
                    >
                      {language?.subtitles
                        ? "✓"
                        : "—"}
                    </td>

                    <td
                      style={
                        languageCellStyle()
                      }
                    >
                      {language?.interface
                        ? "✓"
                        : "—"}
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </div>

      {languages.length >
        3 && (
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
            : `VER MÁS (${languages.length - 3})`}
        </button>
      )}
    </Section>
  );
}

function languageCellStyle(
  textAlign = "center"
) {
  return {
    padding:
      "7px 5px",

    borderBottom:
      "1px solid rgba(255,255,255,.045)",

    color:
      "#cbd1d5",

    fontSize:
      10,

    textAlign,

    fontWeight:
      650,
  };
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
    expanded,
    setExpanded,
  ] = useState(false);

  const [
    openIndex,
    setOpenIndex,
  ] = useState(null);

  if (
    !ratings.length
  ) {
    return null;
  }

  const firstRowCount =
    portrait
      ? 3
      : 4;

  const visible =
    expanded
      ? ratings
      : ratings.slice(
          0,
          firstRowCount
        );

  return (
    <Section title="Clasificación">
      <div
        style={{
          display:
            "grid",

          gridTemplateColumns:
            portrait
              ? "repeat(3,minmax(0,1fr))"
              : "repeat(4,minmax(0,1fr))",

          gap:
            7,
        }}
      >
        {visible.map(
          (
            rating,
            index
          ) => {
            const actualIndex =
              ratings.indexOf(
                rating
              );

            const isOpen =
              openIndex ===
              actualIndex;

            const image =
              rating?.imageUrl ||
              rating?.image_url ||
              rating?.logoUrl ||
              rating?.logo_url ||
              rating?.iconUrl ||
              rating?.icon_url ||
              null;

            const label =
              rating?.region ||
              rating?.organization ||
              "—";

            return (
              <div
                key={`${label}-${actualIndex}`}
                style={{
                  minWidth:
                    0,
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenIndex(
                      isOpen
                        ? null
                        : actualIndex
                    )
                  }
                  style={{
                    width:
                      "100%",

                    minHeight:
                      78,

                    padding:
                      "6px 5px",

                    border:
                      `1px solid ${accent}22`,

                    borderRadius:
                      10,

                    background:
                      "#12161c",

                    color:
                      "#ffffff",

                    cursor:
                      "pointer",

                    touchAction:
                      "manipulation",
                  }}
                >
                  <div
                    style={{
                      marginBottom:
                        4,

                      overflow:
                        "hidden",

                      textOverflow:
                        "ellipsis",

                      whiteSpace:
                        "nowrap",

                      fontSize:
                        8,

                      fontWeight:
                        850,

                      opacity:
                        0.75,
                    }}
                  >
                    {label}
                  </div>

                  <div
                    style={{
                      height:
                        38,

                      display:
                        "grid",

                      placeItems:
                        "center",
                    }}
                  >
                    {image ? (
                      <img
                        src={
                          image
                        }
                        alt=""
                        style={{
                          maxWidth:
                            42,

                          maxHeight:
                            38,

                          objectFit:
                            "contain",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          minWidth:
                            38,

                          padding:
                            "6px 7px",

                          borderRadius:
                            7,

                          background:
                            `${accent}14`,

                          color:
                            "#ffffff",

                          fontSize:
                            14,

                          fontWeight:
                            900,

                          textAlign:
                            "center",
                        }}
                      >
                        {rating?.rating ||
                          "—"}
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      marginTop:
                        3,

                      fontSize:
                        10,

                      opacity:
                        0.65,
                    }}
                  >
                    {isOpen
                      ? "⌃"
                      : "⌄"}
                  </div>
                </button>

                {isOpen && (
                  <div
                    style={{
                      marginTop:
                        6,

                      padding:
                        8,

                      borderRadius:
                        9,

                      background:
                        "#0c0f13",

                      border:
                        "1px solid rgba(255,255,255,.06)",
                    }}
                  >
                    {asArray(
                      rating?.descriptors ||
                        rating?.contentDescriptors
                    ).length >
                      0 && (
                      <div
                        style={{
                          display:
                            "flex",

                          flexWrap:
                            "wrap",

                          gap:
                            4,

                          marginBottom:
                            rating?.synopsis
                              ? 7
                              : 0,
                        }}
                      >
                        {asArray(
                          rating?.descriptors ||
                            rating?.contentDescriptors
                        ).map(
                          (
                            descriptor,
                            descriptorIndex
                          ) => (
                            <span
                              key={`${actualIndex}-${descriptorIndex}`}
                              style={{
                                padding:
                                  "3px 5px",

                                borderRadius:
                                  6,

                                background:
                                  "rgba(255,255,255,.055)",

                                color:
                                  "#a9b1b6",

                                fontSize:
                                  7,
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
                        <CollapsibleText
                          lines={
                            3
                          }
                          accent={
                            accent
                          }
                        >
                          {
                            rating.synopsis
                          }
                        </CollapsibleText>
                      )}
                  </div>
                )}
              </div>
            );
          }
        )}
      </div>

      {ratings.length >
        firstRowCount && (
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
            : `VER MÁS (${ratings.length - firstRowCount})`}
        </button>
      )}
    </Section>
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

        gap:
          8,

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

          fontSize:
            9,

          fontWeight:
            750,
        }}
      >
        {label}
      </div>

      <div
        style={{
          minWidth:
            0,

          color:
            "#d3d9dc",

          fontSize:
            10,

          lineHeight:
            1.35,
        }}
      >
        {value}
      </div>
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
  if (!value) {
    return null;
  }

  return (
    <div
      style={{
        minWidth:
          0,
      }}
    >
      <div
        style={{
          color:
            "#727c83",

          fontSize:
            7,

          textTransform:
            "uppercase",

          fontWeight:
            850,
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop:
            3,

          overflow:
            "hidden",

          textOverflow:
            "ellipsis",

          whiteSpace:
            "nowrap",

          color:
            "#dce1e4",

          fontSize:
            9,

          fontWeight:
            750,
        }}
      >
        {value}
      </div>
    </div>
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
        paddingBottom:
          10,

        marginBottom:
          10,

        borderBottom:
          "1px solid rgba(255,255,255,.05)",
      }}
    >
      <div
        style={{
          marginBottom:
            6,

          color:
            "#747f86",

          fontSize:
            8,

          fontWeight:
            850,

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

          gap:
            5,
        }}
      >
        {values.map(
          (value) => (
            <Chip
              key={
                value
              }
              accent={
                accent
              }
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
   SIMILARES
========================================================= */

function SimilarGames({
  game,
  accent,
  onOpenGame,
}) {
  const scrollRef =
    useRef(null);

  const similar =
    asArray(
      game?.similarGames
    ).filter(
      (item) =>
        item?.available &&
        item?.id &&
        item?.name
    );

  if (
    !similar.length
  ) {
    return null;
  }

  function move(
    direction
  ) {
    const element =
      scrollRef.current;

    if (!element) {
      return;
    }

    element.scrollBy({
      left:
        direction *
        Math.max(
          180,
          element.clientWidth *
            0.72
        ),

      behavior:
        "smooth",
    });
  }

  return (
    <Section title="Juegos similares">
      <div
        style={{
          position:
            "relative",
        }}
      >
        <div
          ref={
            scrollRef
          }
          style={{
            display:
              "flex",

            gap:
              10,

            overflowX:
              "auto",

            paddingBottom:
              4,

            WebkitOverflowScrolling:
              "touch",

            scrollSnapType:
              "x proximity",

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
                  key={
                    item.id
                  }
                  type="button"
                  onClick={() =>
                    onOpenGame?.(
                      item
                    )
                  }
                  style={{
                    flex:
                      "0 0 138px",

                    width:
                      138,

                    padding:
                      0,

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

                    cursor:
                      "pointer",

                    scrollSnapAlign:
                      "start",

                    touchAction:
                      "manipulation",
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

                          display:
                            "block",
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
                      {
                        item.name
                      }
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
              display:
                "flex",

              justifyContent:
                "flex-end",

              gap:
                6,

              marginTop:
                8,
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
        height:
          3,

        background:
          "rgba(255,255,255,.05)",

        overflow:
          "hidden",
      }}
    >
      <div
        style={{
          width:
            "40%",

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
  const [
    viewport,
    setViewport,
  ] = useState(
    getViewport
  );

  const overlayRef =
    useRef(null);

  const [
    activeGame,
    setActiveGame,
  ] = useState(
    game
  );

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

    /* =======================================================
     RADIO — REANUDAR AL CERRAR LA FICHA
  ======================================================= */

  useEffect(() => {
    return () => {
      window.dispatchEvent(
        new CustomEvent(
          "tierra-vicio-media-end"
        )
      );
    };
  }, []);
  
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

  const portrait =
    viewport.height >=
    viewport.width;

  /* =======================================================
     RESET JUEGO
  ======================================================= */

  useEffect(() => {
    setActiveGame(
      game
    );

    setMasterGame(
      null
    );

    setLoadError(
      null
    );

    setGameHistory(
      []
    );
  }, [
    game?.id,
  ]);

  /* =======================================================
     CARGAR MASTER
  ======================================================= */

  useEffect(() => {
    const gameId =
      activeGame?.id;

    if (!gameId) {
      return;
    }

    const controller =
      new AbortController();

    let alive =
      true;

    async function loadGame() {
      setLoading(
        true
      );

      setLoadError(
        null
      );

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
          !response.ok
        ) {
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

        if (
          alive
        ) {
          setMasterGame(
            data.game
          );
        }
      } catch (
        error
      ) {
        if (
          error?.name ===
          "AbortError"
        ) {
          return;
        }

        if (
          alive
        ) {
          setLoadError(
            error instanceof
              Error
              ? error.message
              : "No se pudo cargar la ficha completa."
          );
        }
      } finally {
        if (
          alive
        ) {
          setLoading(
            false
          );
        }
      }
    }

    loadGame();

    return () => {
      alive =
        false;

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

  /* =======================================================
     SIMILARES
  ======================================================= */

  function scrollOverlayTop() {
    requestAnimationFrame(
      () => {
        overlayRef.current
          ?.scrollTo({
            top:
              0,

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

    setMasterGame(
      null
    );

    setActiveGame({
      ...similar,
      accent,
    });

    scrollOverlayTop();
  }

  function goToPreviousGame() {
    if (
      gameHistory.length ===
      0
    ) {
      return;
    }

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

    setMasterGame(
      null
    );

    setActiveGame(
      previous
    );

    scrollOverlayTop();
  }

  /* =======================================================
     BODY LOCK
  ======================================================= */

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

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  });

  if (
    !activeGame?.id
  ) {
    return null;
  }

  const canGoBackGame =
    gameHistory.length >
    0;

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div
      ref={
        overlayRef
      }
      style={{
        position:
          "fixed",

        inset:
          0,

        zIndex:
          100000,

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
      {/* ===================================================
          HEADER
      =================================================== */}

      <header
        style={{
          position:
            "sticky",

          top:
            0,

          zIndex:
            30,

          display:
            "flex",

          alignItems:
            "center",

          gap:
            10,

          minHeight:
            portrait
              ? 58
              : 52,

          padding:
            portrait
              ? "8px 10px"
              : "6px 14px",

          borderBottom:
            `1px solid ${accent}33`,

          background:
            "rgba(5,7,9,.96)",

          backdropFilter:
            "blur(18px)",

          WebkitBackdropFilter:
            "blur(18px)",
        }}
      >
        {(canGoBackGame ||
          onBack) && (
          <button
            type="button"
            onClick={
              canGoBackGame
                ? goToPreviousGame
                : onBack
            }
            style={
              navButtonStyle()
            }
          >
            ‹
          </button>
        )}

        {cover && (
          <img
            src={
              cover
            }
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

              borderRadius:
                6,
            }}
          />
        )}

        <div
          style={{
            minWidth:
              0,

            flex:
              1,
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
                  : 15,

              fontWeight:
                850,
            }}
          >
            {title}
          </div>

          <div
            style={{
              marginTop:
                2,

              overflow:
                "hidden",

              textOverflow:
                "ellipsis",

              whiteSpace:
                "nowrap",

              color:
                "#858f95",

              fontSize:
                9,
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
          accent={
            accent
          }
        />
      )}

      <main
        style={{
          width:
            "100%",

          maxWidth:
            1280,

          margin:
            "0 auto",

          padding:
            portrait
              ? "12px 10px 60px"
              : "10px 14px 60px",

          boxSizing:
            "border-box",
        }}
      >
        {loadError && (
          <div
            style={{
              marginBottom:
                10,

              padding:
                10,

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
            {loadError}
          </div>
        )}

        {/* =================================================
            HERO VERTICAL
        ================================================= */}

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

                gap:
                  11,

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

                    border:
                      "1px solid rgba(255,255,255,.09)",

                    background:
                      "#101318",
                  }}
                >
                  <img
                    src={
                      cover
                    }
                    alt={
                      title
                    }
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
                  minWidth:
                    0,
                }}
              >
                <div
                  style={{
                    display:
                      "grid",

                    gridTemplateColumns:
                      "repeat(3,minmax(0,1fr))",

                    gap:
                      5,
                  }}
                >
                  <ScoreBox
                    compact
                    label="Oficial"
                    value={formatScore(
                      official.value
                    )}
                    accent={
                      accent
                    }
                  />

                  <ScoreBox
                    compact
                    label="Comunidad"
                    value={formatScore(
                      community.value
                    )}
                  />

                  <ScoreBox
                    compact
                    label="Mi evaluación"
                    value="—"
                  />
                </div>

                <div
                  style={{
                    marginTop:
                      7,
                  }}
                >
                  <DataRow
                    label="Año"
                    value={
                      year
                    }
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

                {platforms.length >
                  0 && (
                  <div
                    style={{
                      display:
                        "flex",

                      flexWrap:
                        "wrap",

                      gap:
                        5,

                      marginTop:
                        7,
                    }}
                  >
                    {platforms
                      .slice(
                        0,
                        5
                      )
                      .map(
                        (
                          platform
                        ) => (
                          <Chip
                            key={
                              platform
                            }
                            accent={
                              accent
                            }
                          >
                            {
                              platform
                            }
                          </Chip>
                        )
                      )}
                  </div>
                )}
              </div>
            </div>

            <div
              style={{
                marginTop:
                  11,
              }}
            >
              <Section
                title="Vídeo"
                style={{
                  padding:
                    12,
                }}
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
          /* =================================================
             HERO HORIZONTAL
          ================================================= */

          <>
            <div
              style={{
                display:
                  "grid",

                gridTemplateColumns:
                  cover
                    ? "minmax(170px, 24%) minmax(0,1fr)"
                    : "1fr",

                gap:
                  12,

                height:
                  "min(330px, 46vw)",

                minHeight:
                  240,

                maxHeight:
                  330,

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

                    border:
                      "1px solid rgba(255,255,255,.09)",

                    background:
                      "#101318",
                  }}
                >
                  <img
                    src={
                      cover
                    }
                    alt={
                      title
                    }
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

            {/* DATOS + PUNTAJES */}

            <div
              style={{
                display:
                  "grid",

                gridTemplateColumns:
                  "repeat(7,minmax(0,1fr))",

                gap:
                  6,

                marginTop:
                  9,

                padding:
                  9,

                borderRadius:
                  12,

                border:
                  "1px solid rgba(255,255,255,.07)",

                background:
                  "#101318",
              }}
            >
              <HeroData
                label="Año"
                value={
                  year
                }
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

              <HeroData
                label="Oficial"
                value={
                  formatScore(
                    official.value
                  )
                }
              />

              <HeroData
                label="Comunidad"
                value={
                  formatScore(
                    community.value
                  )
                }
              />

              <HeroData
                label="Mi evaluación"
                value="—"
              />

              <HeroData
                label="Plataformas"
                value={
                  platforms
                    .slice(
                      0,
                      3
                    )
                    .join(
                      " · "
                    )
                }
              />
            </div>
          </>
        )}

        {/* =================================================
            DESCRIPCIÓN
        ================================================= */}

        {description && (
          <div
            style={{
              marginTop:
                11,
            }}
          >
            <Section title="Descripción">
              <CollapsibleText
                lines={
                  4
                }
                accent={
                  accent
                }
              >
                {description}
              </CollapsibleText>
            </Section>
          </div>
        )}

        {/* =================================================
            GALERÍA
        ================================================= */}

        <div
          style={{
            marginTop:
              11,
          }}
        >
          <Gallery
            game={
              displayGame
            }
            portrait={
              portrait
            }
          />
        </div>

        {/* =================================================
            FICHA TÉCNICA
        ================================================= */}

        <div
          style={{
            display:
              "grid",

            gridTemplateColumns:
              portrait
                ? "1fr"
                : "1fr 1fr",

            gap:
              10,

            marginTop:
              11,
          }}
        >
          <Section title="Ficha técnica">
            <DataRow
              label="Año"
              value={
                year
              }
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

        {/* =================================================
            IDIOMAS
        ================================================= */}

        <div
          style={{
            marginTop:
              11,
          }}
        >
          <Languages
            game={
              displayGame
            }
          />
        </div>

        {/* =================================================
            CLASIFICACIÓN
        ================================================= */}

        <div
          style={{
            marginTop:
              11,
          }}
        >
          <AgeRatings
            game={
              displayGame
            }
            accent={
              accent
            }
            portrait={
              portrait
            }
          />
        </div>

        {/* =================================================
            HISTORIA
        ================================================= */}

        {storyline && (
          <div
            style={{
              marginTop:
                11,
            }}
          >
            <Section title="Historia">
              <CollapsibleText
                lines={
                  4
                }
                accent={
                  accent
                }
              >
                {storyline}
              </CollapsibleText>
            </Section>
          </div>
        )}

        {/* =================================================
            SIMILARES
        ================================================= */}

        <div
          style={{
            marginTop:
              11,
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

        {/* =================================================
            BOTONES FINALES
        ================================================= */}

        <div
          style={{
            display:
              "flex",

            justifyContent:
              "center",

            gap:
              8,

            flexWrap:
              "wrap",

            marginTop:
              17,
          }}
        >
          {canGoBackGame ? (
            <button
              type="button"
              onClick={
                goToPreviousGame
              }
              style={
                secondaryButtonStyle()
              }
            >
              VOLVER AL JUEGO ANTERIOR
            </button>
          ) : (
            onBack && (
              <button
                type="button"
                onClick={
                  onBack
                }
                style={
                  secondaryButtonStyle()
                }
              >
                VOLVER
              </button>
            )
          )}

          <button
            type="button"
            onClick={
              onClose
            }
            style={{
              minHeight:
                41,

              padding:
                "9px 17px",

              border:
                `1px solid ${accent}`,

              borderRadius:
                11,

              background:
                accent,

              color:
                "#050708",

              fontSize:
                10,

              fontWeight:
                950,

              cursor:
                "pointer",

              touchAction:
                "manipulation",
            }}
          >
            CERRAR
          </button>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   BUTTONS
========================================================= */

function expandButtonStyle() {
  return {
    marginTop:
      9,

    padding:
      0,

    border:
      0,

    background:
      "transparent",

    color:
      "#8bdff5",

    fontSize:
      9,

    fontWeight:
      900,

    cursor:
      "pointer",

    touchAction:
      "manipulation",
  };
}

function secondaryButtonStyle() {
  return {
    minHeight:
      41,

    padding:
      "9px 15px",

    border:
      "1px solid rgba(255,255,255,.13)",

    borderRadius:
      11,

    background:
      "#171b20",

    color:
      "#ffffff",

    fontSize:
      10,

    fontWeight:
      900,

    cursor:
      "pointer",

    touchAction:
      "manipulation",
  };
}
