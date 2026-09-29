"use client";

import {
  useEffect,
  useState,
} from "react";

/* =========================================================
   FREAKY WORLD
   MINI FICHA RESPONSIVE DE CONSOLA

   - vertical: diseño apilado
   - horizontal: diseño compacto en dos columnas
   - soporta cambios de orientación en vivo
   - evita depender de 100vh
========================================================= */

function getViewportSize() {
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
   COMPONENTE
========================================================= */

export default function ConsoleMiniCard({
  consoleData,
  onClose,
  onOpenGames,
  onOpenFullCard,
  onOpenVideo,
}) {
  const [
    viewport,
    setViewport,
  ] = useState(
    getViewportSize
  );

  /* =======================================================
     VIEWPORT / ORIENTACIÓN
  ======================================================= */

  useEffect(() => {
    function updateViewport() {
      setViewport(
        getViewportSize()
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

    window.visualViewport?.addEventListener(
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

      window.visualViewport?.removeEventListener(
        "resize",
        updateViewport
      );
    };
  }, []);

  /* =======================================================
     ESC
  ======================================================= */

  useEffect(() => {
    if (!consoleData) {
      return;
    }

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
  }, [
    consoleData,
    onClose,
  ]);

  if (!consoleData) {
    return null;
  }

  /* =======================================================
     ORIENTACIÓN
  ======================================================= */

  const landscape =
    viewport.width >
    viewport.height;

  const veryShort =
    viewport.height <
    430;

  /* =======================================================
     DATOS
  ======================================================= */

  const {
    name = "Consola",

    manufacturer = "",

    year = "",

    generation = "",

    imageUrl = null,

    videos = [],
  } = consoleData;

  const primaryVideo =
    videos?.[0] ||
    null;

  const secondaryVideo =
    videos?.[1] ||
    null;

  /* =======================================================
     MEDIDAS RESPONSIVE
  ======================================================= */

  const cardWidth =
    landscape
      ? Math.min(
          680,
          viewport.width -
            32
        )
      : Math.min(
          380,
          viewport.width -
            24
        );

  const cardMaxHeight =
    Math.max(
      250,
      viewport.height -
        (landscape
          ? 20
          : 40)
    );

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div
      onClick={(
        event
      ) => {
        event.stopPropagation();
      }}
      onPointerDown={(
        event
      ) => {
        event.stopPropagation();
      }}
      style={{
        width:
          cardWidth,

        maxWidth:
          "100%",

        maxHeight:
          cardMaxHeight,

        display:
          landscape
            ? "grid"
            : "block",

        gridTemplateColumns:
          landscape
            ? "minmax(180px, 42%) minmax(0, 1fr)"
            : undefined,

        overflowX:
          "hidden",

        overflowY:
          "auto",

        WebkitOverflowScrolling:
          "touch",

        borderRadius:
          landscape
            ? 18
            : 22,

        background:
          "rgba(10,12,18,0.98)",

        border:
          "1px solid rgba(255,255,255,0.16)",

        boxShadow:
          "0 24px 80px rgba(0,0,0,0.58)",

        color:
          "#ffffff",

        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",

        backdropFilter:
          "blur(18px)",

        WebkitBackdropFilter:
          "blur(18px)",

        overscrollBehavior:
          "contain",

        touchAction:
          "pan-y",
      }}
    >
      {/* ===================================================
          HERO
      =================================================== */}

      <div
        style={{
          position:
            "relative",

          minHeight:
            landscape
              ? veryShort
                ? 210
                : 250
              : 190,

          height:
            landscape
              ? "100%"
              : 190,

          background:
            "linear-gradient(145deg, #202632 0%, #0c0e13 100%)",

          overflow:
            "hidden",
        }}
      >
        {imageUrl ? (
          <img
            src={
              imageUrl
            }
            alt={
              name
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

              objectFit:
                "contain",

              padding:
                landscape
                  ? 14
                  : 18,

              boxSizing:
                "border-box",

              userSelect:
                "none",

              WebkitUserSelect:
                "none",
            }}
          />
        ) : (
          <div
            style={{
              width:
                "100%",

              height:
                "100%",

              minHeight:
                landscape
                  ? 210
                  : 190,

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              flexDirection:
                "column",

              gap: 8,

              padding:
                18,

              boxSizing:
                "border-box",

              textAlign:
                "center",

              opacity:
                0.65,
            }}
          >
            <div
              style={{
                fontSize:
                  landscape
                    ? 27
                    : 36,

                fontWeight:
                  900,

                letterSpacing:
                  -1.5,

                lineHeight:
                  1,
              }}
            >
              {name}
            </div>

            <div
              style={{
                fontSize:
                  10,

                textTransform:
                  "uppercase",

                letterSpacing:
                  2,

                opacity:
                  0.5,
              }}
            >
              imagen de consola
            </div>
          </div>
        )}

        {/* CERRAR */}

        <button
          type="button"
          aria-label="Cerrar"
          onClick={() =>
            onClose?.()
          }
          style={{
            position:
              "absolute",

            top: 10,
            right: 10,

            zIndex: 5,

            width: 38,
            height: 38,

            border: 0,

            borderRadius:
              999,

            background:
              "rgba(0,0,0,0.65)",

            color:
              "#fff",

            fontSize:
              21,

            lineHeight:
              1,

            cursor:
              "pointer",

            touchAction:
              "manipulation",
          }}
        >
          ×
        </button>
      </div>

      {/* ===================================================
          INFORMACIÓN
      =================================================== */}

      <div
        style={{
          display:
            "flex",

          flexDirection:
            "column",

          minWidth:
            0,

          padding:
            landscape
              ? "15px 16px 16px"
              : "18px 18px 20px",

          boxSizing:
            "border-box",
        }}
      >
        {/* FABRICANTE */}

        {manufacturer && (
          <div
            style={{
              marginBottom:
                4,

              fontSize:
                10,

              fontWeight:
                700,

              textTransform:
                "uppercase",

              letterSpacing:
                1.6,

              opacity:
                0.5,
            }}
          >
            {manufacturer}
          </div>
        )}

        {/* NOMBRE */}

        <div
          style={{
            fontSize:
              landscape
                ? 22
                : 25,

            lineHeight:
              1.05,

            fontWeight:
              850,

            letterSpacing:
              -0.6,
          }}
        >
          {name}
        </div>

        {/* DATOS */}

        <div
          style={{
            display:
              "flex",

            flexWrap:
              "wrap",

            gap: 7,

            marginTop:
              9,
          }}
        >
          {year && (
            <DataPill>
              {year}
            </DataPill>
          )}

          {generation && (
            <DataPill>
              {generation}
            </DataPill>
          )}
        </div>

        {/* =================================================
            VIDEO PRINCIPAL
        ================================================= */}

        {primaryVideo && (
          <div
            style={{
              marginTop:
                landscape
                  ? 12
                  : 18,
            }}
          >
            <div
              style={{
                marginBottom:
                  7,

                fontSize:
                  9,

                textTransform:
                  "uppercase",

                letterSpacing:
                  1.3,

                opacity:
                  0.48,
              }}
            >
              Video destacado
            </div>

            <VideoCard
              video={
                primaryVideo
              }
              primary
              compact={
                landscape
              }
              onOpen={() =>
                onOpenVideo?.(
                  primaryVideo
                )
              }
            />
          </div>
        )}

        {/* SEGUNDO VIDEO */}

        {secondaryVideo &&
          !veryShort && (
            <div
              style={{
                marginTop:
                  7,
              }}
            >
              <VideoCard
                video={
                  secondaryVideo
                }
                compact
                onOpen={() =>
                  onOpenVideo?.(
                    secondaryVideo
                  )
                }
              />
            </div>
          )}

        {/* =================================================
            SIN VIDEO
        ================================================= */}

        {!primaryVideo && (
          <div
            style={{
              marginTop:
                landscape
                  ? 12
                  : 18,

              padding:
                landscape
                  ? 9
                  : 12,

              borderRadius:
                10,

              background:
                "rgba(255,255,255,0.045)",

              border:
                "1px solid rgba(255,255,255,0.06)",

              fontSize:
                landscape
                  ? 10
                  : 11,

              lineHeight:
                1.35,

              opacity:
                0.48,
            }}
          >
            Video oficial pendiente de conexión.
          </div>
        )}

        {/* =================================================
            BOTONES

            Siempre quedan visibles dentro del flujo.
            En horizontal reducen tamaño pero no desaparecen.
        ================================================= */}

        <div
          style={{
            display:
              "grid",

            gridTemplateColumns:
              "1fr 1fr",

            gap: 8,

            marginTop:
              "auto",

            paddingTop:
              landscape
                ? 12
                : 18,
          }}
        >
          <button
            type="button"
            onClick={() =>
              onOpenGames?.(
                consoleData
              )
            }
            style={{
              minWidth:
                0,

              minHeight:
                landscape
                  ? 42
                  : 46,

              padding:
                "8px 10px",

              border:
                "1px solid rgba(255,255,255,0.14)",

              borderRadius:
                11,

              background:
                "rgba(255,255,255,0.07)",

              color:
                "#ffffff",

              fontSize:
                13,

              fontWeight:
                750,

              cursor:
                "pointer",

              touchAction:
                "manipulation",
            }}
          >
            Juegos
          </button>

          <button
            type="button"
            onClick={() =>
              onOpenFullCard?.(
                consoleData
              )
            }
            style={{
              minWidth:
                0,

              minHeight:
                landscape
                  ? 42
                  : 46,

              padding:
                "8px 10px",

              border:
                0,

              borderRadius:
                11,

              background:
                "#ffffff",

              color:
                "#090b10",

              fontSize:
                13,

              fontWeight:
                800,

              cursor:
                "pointer",

              touchAction:
                "manipulation",
            }}
          >
            Ver ficha
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DATA PILL
========================================================= */

function DataPill({
  children,
}) {
  return (
    <div
      style={{
        padding:
          "5px 8px",

        borderRadius:
          999,

        background:
          "rgba(255,255,255,0.075)",

        border:
          "1px solid rgba(255,255,255,0.07)",

        fontSize:
          10,

        fontWeight:
          650,

        color:
          "rgba(255,255,255,0.82)",
      }}
    >
      {children}
    </div>
  );
}

/* =========================================================
   VIDEO
========================================================= */

function VideoCard({
  video,
  primary = false,
  compact = false,
  onOpen,
}) {
  const thumbnail =
    video?.thumbnail ||
    video?.thumbnailUrl ||
    null;

  return (
    <button
      type="button"
      onClick={
        onOpen
      }
      style={{
        width:
          "100%",

        display:
          "flex",

        alignItems:
          "center",

        gap: 9,

        padding:
          compact
            ? 6
            : primary
              ? 0
              : 8,

        overflow:
          "hidden",

        border:
          "1px solid rgba(255,255,255,0.09)",

        borderRadius:
          11,

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
      <div
        style={{
          position:
            "relative",

          flex:
            compact
              ? "0 0 82px"
              : primary
                ? "0 0 135px"
                : "0 0 92px",

          height:
            compact
              ? 48
              : primary
                ? 76
                : 55,

          overflow:
            "hidden",

          background:
            "#181b22",

          borderRadius:
            8,
        }}
      >
        {thumbnail && (
          <img
            src={
              thumbnail
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
            }}
          />
        )}

        <div
          style={{
            position:
              "absolute",

            inset: 0,

            display:
              "flex",

            alignItems:
              "center",

            justifyContent:
              "center",

            background:
              thumbnail
                ? "rgba(0,0,0,.2)"
                : "transparent",
          }}
        >
          <div
            style={{
              width:
                compact
                  ? 27
                  : 32,

              height:
                compact
                  ? 27
                  : 32,

              display:
                "grid",

              placeItems:
                "center",

              paddingLeft:
                2,

              borderRadius:
                999,

              background:
                "rgba(255,255,255,.92)",

              color:
                "#090a0d",

              fontSize:
                12,

              fontWeight:
                900,
            }}
          >
            ▶
          </div>
        </div>
      </div>

      <div
        style={{
          flex: 1,

          minWidth:
            0,
        }}
      >
        <div
          style={{
            display:
              "-webkit-box",

            WebkitLineClamp:
              2,

            WebkitBoxOrient:
              "vertical",

            overflow:
              "hidden",

            fontSize:
              compact
                ? 10
                : 12,

            lineHeight:
              1.3,

            fontWeight:
              700,
          }}
        >
          {video?.title ||
            "Video oficial"}
        </div>

        {video?.channel && (
          <div
            style={{
              marginTop:
                3,

              overflow:
                "hidden",

              whiteSpace:
                "nowrap",

              textOverflow:
                "ellipsis",

              fontSize:
                9,

              opacity:
                0.45,
            }}
          >
            {video.channel}
          </div>
        )}
      </div>
    </button>
  );
}
