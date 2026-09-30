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

  return Number(
    value
  ).toFixed(1);
}

function normalizeNamedItems(
  items
) {
  return asArray(items)
    .map(
      (item) =>
        typeof item ===
        "string"
          ? item
          : item?.name ||
            item?.title ||
            item?.abbreviation
    )
    .filter(Boolean);
}

function getYoutubeId(
  video
) {
  return (
    video?.youtubeId ||
    video?.youtube_id ||
    null
  );
}

function chooseFirstVideo(
  game
) {
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
            video?.name || ""
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

  const viewport =
    window.visualViewport;

  return {
    width:
      viewport?.width ||
      window.innerWidth ||
      390,

    height:
      viewport?.height ||
      window.innerHeight ||
      700,
  };
}

/* =========================================================
   BASE UI
========================================================= */

function Section({
  title,
  children,
  style,
}) {
  return (
    <section
      style={{
        padding: 16,
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
              "0 0 12px",

            color:
              "#f4f6f7",

            fontSize:
              14,

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
          27,

        padding:
          "4px 9px",

        border:
          `1px solid ${accent}38`,

        borderRadius:
          999,

        background:
          `${accent}10`,

        color:
          "#dbe2e6",

        fontSize:
          10,

        fontWeight:
          700,
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
            13,

          lineHeight:
            1.65,

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
            9,

          padding:
            0,

          border:
            0,

          background:
            "transparent",

          color:
            accent,

          fontSize:
            10,

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
}) {
  return (
    <div
      style={{
        minWidth:
          0,

        padding:
          "10px 7px",

        border:
          "1px solid rgba(255,255,255,.075)",

        borderRadius:
          13,

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
          marginTop:
            5,

          color:
            accent ||
            "#ffffff",

          fontSize:
            23,

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
              8,
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
  compact = false,
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

          aspectRatio:
            "16 / 9",

          display:
            "grid",

          placeItems:
            "center",

          border:
            "1px solid rgba(255,255,255,.07)",

          borderRadius:
            15,

          background:
            "#0c0f13",

          color:
            "#68727a",

          fontSize:
            11,
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
    <div>
      <div
        style={{
          position:
            "relative",

          width:
            "100%",

          aspectRatio:
            "16 / 9",

          overflow:
            "hidden",

          border:
            "1px solid rgba(255,255,255,.09)",

          borderRadius:
            compact
              ? 13
              : 16,

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
              9,

            marginTop:
              8,
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
                50,

              textAlign:
                "center",

              color:
                "#7f8990",

              fontSize:
                9,
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
   GALERÍA MOSAICO
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

  const scrollRef =
    useRef(null);

  const [
    fullscreen,
    setFullscreen,
  ] = useState(false);

  const [
    activeIndex,
    setActiveIndex,
  ] = useState(0);

  const touchStartX =
    useRef(null);

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
          260,
          element.clientWidth *
            0.78
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

  function handleTouchStart(
    event
  ) {
    touchStartX.current =
      event.touches?.[0]
        ?.clientX ??
      null;
  }

  function handleTouchEnd(
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

  const activeImage =
    images[
      Math.min(
        activeIndex,
        images.length - 1
      )
    ];

  return (
    <>
      <Section title="Galería">
        <div
          style={{
            position:
              "relative",
          }}
        >
          <button
            type="button"
            aria-label="Galería anterior"
            onClick={() =>
              moveCarousel(-1)
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
                "2px 48px 5px",

              WebkitOverflowScrolling:
                "touch",

              scrollSnapType:
                "x proximity",

              scrollbarWidth:
                "none",
            }}
          >
            {images.map(
              (
                image,
                index
              ) => {
                const pattern =
                  index %
                  3;

                const tall =
                  pattern ===
                  0;

                return (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => {
                      setActiveIndex(
                        index
                      );

                      setFullscreen(
                        true
                      );
                    }}
                    style={{
                      flex:
                        tall
                          ? "0 0 210px"
                          : "0 0 280px",

                      width:
                        tall
                          ? 210
                          : 280,

                      height:
                        tall
                          ? 320
                          : 155,

                      padding:
                        0,

                      overflow:
                        "hidden",

                      border:
                        "1px solid rgba(255,255,255,.08)",

                      borderRadius:
                        13,

                      background:
                        "#090b0f",

                      cursor:
                        "pointer",

                      scrollSnapAlign:
                        "start",
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

                        objectFit:
                          "cover",

                        display:
                          "block",
                      }}
                    />
                  </button>
                );
              }
            )}
          </div>

          <button
            type="button"
            aria-label="Galería siguiente"
            onClick={() =>
              moveCarousel(1)
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
            handleTouchStart
          }
          onTouchEnd={
            handleTouchEnd
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
              activeImage
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

              objectFit:
                "contain",

              borderRadius:
                12,

              userSelect:
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
              330,

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
                    key={
                      label
                    }
                    style={{
                      padding:
                        "7px 6px",

                      borderBottom:
                        "1px solid rgba(255,255,255,.08)",

                      color:
                        "#758087",

                      fontSize:
                        9,

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
      "8px 6px",

    borderBottom:
      "1px solid rgba(255,255,255,.045)",

    color:
      "#cbd1d5",

    fontSize:
      11,

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

  const visible =
    expanded
      ? ratings
      : ratings.slice(
          0,
          4
        );

  return (
    <Section title="Clasificación">
      <div
        style={{
          display:
            "grid",

          gridTemplateColumns:
            "repeat(auto-fit,minmax(82px,1fr))",

          gap:
            8,
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
                      102,

                    padding:
                      "8px 7px",

                    border:
                      `1px solid ${accent}22`,

                    borderRadius:
                      12,

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
                        6,

                      fontSize:
                        9,

                      fontWeight:
                        850,

                      opacity:
                        0.72,
                    }}
                  >
                    {label}
                  </div>

                  {image ? (
                    <img
                      src={
                        image
                      }
                      alt=""
                      style={{
                        width:
                          52,

                        height:
                          52,

                        objectFit:
                          "contain",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        minHeight:
                          52,

                        display:
                          "grid",

                        placeItems:
                          "center",

                        padding:
                          6,

                        borderRadius:
                          9,

                        background:
                          `${accent}18`,

                        color:
                          "#ffffff",

                        fontSize:
                          17,

                        fontWeight:
                          900,
                      }}
                    >
                      {rating?.rating ||
                        "—"}
                    </div>
                  )}

                  <div
                    style={{
                      marginTop:
                        5,

                      fontSize:
                        12,

                      opacity:
                        0.7,
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
                        7,

                      padding:
                        10,

                      borderRadius:
                        10,

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
                            5,

                          marginBottom:
                            rating?.synopsis
                              ? 8
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
                                  "4px 6px",

                                borderRadius:
                                  7,

                                background:
                                  "rgba(255,255,255,.055)",

                                color:
                                  "#a9b1b6",

                                fontSize:
                                  8,
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
            : `VER MÁS (${ratings.length - 4})`}
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
          "110px minmax(0,1fr)",

        gap:
          10,

        padding:
          "8px 0",

        borderBottom:
          "1px solid rgba(255,255,255,.05)",
      }}
    >
      <div
        style={{
          color:
            "#747f86",

          fontSize:
            10,

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
            11,

          lineHeight:
            1.4,
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
          12,

        marginBottom:
          12,

        borderBottom:
          "1px solid rgba(255,255,255,.05)",
      }}
    >
      <div
        style={{
          marginBottom:
            7,

          color:
            "#747f86",

          fontSize:
            9,

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
                      "0 0 140px",

                    width:
                      140,

                    padding:
                      0,

                    overflow:
                      "hidden",

                    border:
                      "1px solid rgba(255,255,255,.08)",

                    borderRadius:
                      13,

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
                        "9px 9px 10px",
                    }}
                  >
                    <div
                      style={{
                        minHeight:
                          32,

                        fontSize:
                          11,

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
                          9,
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
                9,
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
     RESET
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
     BODY SCROLL
  ======================================================= */

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
          TÍTULO ÚNICO
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
            58,

          padding:
            portrait
              ? "8px 10px"
              : "8px 14px",

          borderBottom:
            `1px solid ${accent}33`,

          background:
            "rgba(5,7,9,.95)",

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
                38,

              height:
                50,

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
                  : 17,

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
                10,
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
              : "14px 16px 70px",

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
                  12,

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
                      15,

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

              <div>
                <div
                  style={{
                    display:
                      "grid",

                    gridTemplateColumns:
                      "repeat(2,minmax(0,1fr))",

                    gap:
                      6,
                  }}
                >
                  <ScoreBox
                    label="Oficial"
                    value={formatScore(
                      official.value
                    )}
                    sublabel={
                      official.votes
                        ? `${official.votes} votos`
                        : "Sin evaluar"
                    }
                    accent={
                      accent
                    }
                  />

                  <ScoreBox
                    label="Comunidad"
                    value={formatScore(
                      community.value
                    )}
                    sublabel={
                      community.votes
                        ? `${community.votes} votos`
                        : "Sin votos"
                    }
                  />
                </div>

                <div
                  style={{
                    marginTop:
                      8,
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
                        8,
                    }}
                  >
                    {platforms
                      .slice(
                        0,
                        4
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
                  12,
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
                    ? "180px minmax(0,1fr)"
                    : "1fr",

                gap:
                  14,

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
                      15,

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

              <VideoPlayer
                game={
                  displayGame
                }
                compact
              />
            </div>

            <div
              style={{
                display:
                  "grid",

                gridTemplateColumns:
                  "repeat(6,minmax(0,1fr))",

                gap:
                  6,

                marginTop:
                  10,

                padding:
                  10,

                borderRadius:
                  13,

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
                value={formatScore(
                  official.value
                )}
              />

              <HeroData
                label="Comunidad"
                value={formatScore(
                  community.value
                )}
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
                12,
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
              12,
          }}
        >
          <Gallery
            game={
              displayGame
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
              12,
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
                typeof displayGame?.collection ===
                "string"
                  ? displayGame.collection
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
                typeof displayGame?.franchise ===
                "string"
                  ? displayGame.franchise
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
              12,
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
              12,
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

        {/* =================================================
            HISTORIA
        ================================================= */}

        {storyline && (
          <div
            style={{
              marginTop:
                12,
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
              12,
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
              18,
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
                42,

              padding:
                "9px 18px",

              border:
                `1px solid ${accent}`,

              borderRadius:
                12,

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
   HERO DATA
========================================================= */

function HeroData({
  label,
  value,
}) {
  if (!value) {
    return (
      <div />
    );
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
            8,

          textTransform:
            "uppercase",

          fontWeight:
            800,
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
            10,

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
   BUTTONS
========================================================= */

function expandButtonStyle() {
  return {
    marginTop:
      10,

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
      42,

    padding:
      "9px 16px",

    border:
      "1px solid rgba(255,255,255,.13)",

    borderRadius:
      12,

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
  };
}
