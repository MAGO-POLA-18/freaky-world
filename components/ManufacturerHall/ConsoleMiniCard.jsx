"use client";

import { useEffect } from "react";

/* =========================================================
   FREAKY WORLD
   MINI FICHA GENÉRICA DE CONSOLA

   Sirve para:
   - PlayStation
   - Nintendo
   - Xbox
   - Meta
   - Valve
   - históricas

   Más adelante:
   imageUrl y videos podrán venir del enriquecedor automático.
========================================================= */

export default function ConsoleMiniCard({
  consoleData,
  onClose,
  onOpenGames,
  onOpenFullCard,
  onOpenVideo,
}) {
  /* =======================================================
     CERRAR CON ESC
  ======================================================= */

  useEffect(() => {
    if (!consoleData) {
      return;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
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
    videos?.[0] || null;

  const secondaryVideo =
    videos?.[1] || null;

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div
      onClick={(event) => {
        /*
          Evita cerrar la ficha al tocar
          dentro del propio panel.
        */
        event.stopPropagation();
      }}
      style={{
        width: "min(360px, calc(100vw - 32px))",

        maxHeight:
          "min(650px, calc(100vh - 80px))",

        overflowY: "auto",

        borderRadius: 22,

        background:
          "rgba(10, 12, 18, 0.97)",

        border:
          "1px solid rgba(255,255,255,0.16)",

        boxShadow:
          "0 24px 80px rgba(0,0,0,0.58)",

        color: "#ffffff",

        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",

        backdropFilter:
          "blur(18px)",

        WebkitBackdropFilter:
          "blur(18px)",

        overflow: "hidden",
      }}
    >
      {/* ===================================================
          FOTO / HERO
      =================================================== */}

      <div
        style={{
          position: "relative",

          height: 190,

          background:
            "linear-gradient(145deg, #202632 0%, #0c0e13 100%)",

          overflow: "hidden",
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",

              objectFit: "contain",

              padding: 18,

              boxSizing:
                "border-box",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",

              display: "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              flexDirection:
                "column",

              gap: 8,

              opacity: 0.65,
            }}
          >
            <div
              style={{
                fontSize: 42,
                fontWeight: 900,
                letterSpacing: -2,
              }}
            >
              {name}
            </div>

            <div
              style={{
                fontSize: 11,

                textTransform:
                  "uppercase",

                letterSpacing: 2,

                opacity: 0.5,
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

            top: 12,
            right: 12,

            width: 34,
            height: 34,

            border: 0,
            borderRadius: 999,

            background:
              "rgba(0,0,0,0.55)",

            color: "white",

            fontSize: 19,

            cursor: "pointer",
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
          padding:
            "18px 18px 20px",
        }}
      >
        {/* FABRICANTE */}

        {manufacturer && (
          <div
            style={{
              marginBottom: 5,

              fontSize: 10,

              fontWeight: 700,

              textTransform:
                "uppercase",

              letterSpacing: 1.6,

              opacity: 0.5,
            }}
          >
            {manufacturer}
          </div>
        )}

        {/* NOMBRE */}

        <div
          style={{
            fontSize: 25,

            lineHeight: 1.05,

            fontWeight: 850,

            letterSpacing: -0.6,
          }}
        >
          {name}
        </div>

        {/* DATOS RÁPIDOS */}

        <div
          style={{
            display: "flex",

            flexWrap: "wrap",

            gap: 7,

            marginTop: 11,
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
              marginTop: 18,
            }}
          >
            <div
              style={{
                marginBottom: 8,

                fontSize: 10,

                textTransform:
                  "uppercase",

                letterSpacing: 1.3,

                opacity: 0.48,
              }}
            >
              Video destacado
            </div>

            <VideoCard
              video={
                primaryVideo
              }
              primary
              onOpen={() =>
                onOpenVideo?.(
                  primaryVideo
                )
              }
            />
          </div>
        )}

        {/* =================================================
            SEGUNDO VIDEO
        ================================================= */}

        {secondaryVideo && (
          <div
            style={{
              marginTop: 9,
            }}
          >
            <VideoCard
              video={
                secondaryVideo
              }
              onOpen={() =>
                onOpenVideo?.(
                  secondaryVideo
                )
              }
            />
          </div>
        )}

        {/* =================================================
            SIN VIDEO TODAVÍA
        ================================================= */}

        {!primaryVideo && (
          <div
            style={{
              marginTop: 18,

              padding: 13,

              borderRadius: 12,

              background:
                "rgba(255,255,255,0.045)",

              border:
                "1px solid rgba(255,255,255,0.06)",

              fontSize: 11,

              lineHeight: 1.4,

              opacity: 0.48,
            }}
          >
            El video oficial se cargará automáticamente cuando
            conectemos el contenido de plataformas.
          </div>
        )}

        {/* =================================================
            BOTONES
        ================================================= */}

        <div
          style={{
            display: "grid",

            gridTemplateColumns:
              "1fr 1fr",

            gap: 9,

            marginTop: 18,
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
              minHeight: 45,

              border:
                "1px solid rgba(255,255,255,0.14)",

              borderRadius: 12,

              background:
                "rgba(255,255,255,0.07)",

              color: "#ffffff",

              fontSize: 13,

              fontWeight: 750,

              cursor: "pointer",
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
              minHeight: 45,

              border: 0,

              borderRadius: 12,

              background:
                "#ffffff",

              color: "#090b10",

              fontSize: 13,

              fontWeight: 800,

              cursor: "pointer",
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
          "6px 9px",

        borderRadius: 999,

        background:
          "rgba(255,255,255,0.075)",

        border:
          "1px solid rgba(255,255,255,0.07)",

        fontSize: 11,

        fontWeight: 650,

        color:
          "rgba(255,255,255,0.82)",
      }}
    >
      {children}
    </div>
  );
}

/* =========================================================
   VIDEO CARD
========================================================= */

function VideoCard({
  video,
  primary = false,
  onOpen,
}) {
  const thumbnail =
    video?.thumbnail ||
    video?.thumbnailUrl ||
    null;

  return (
    <button
      type="button"
      onClick={onOpen}
      style={{
        width: "100%",

        display: "flex",

        alignItems:
          "center",

        gap: 11,

        padding: primary
          ? 0
          : 8,

        overflow: "hidden",

        border:
          "1px solid rgba(255,255,255,0.09)",

        borderRadius: 13,

        background:
          "rgba(255,255,255,0.045)",

        color: "#ffffff",

        textAlign: "left",

        cursor: "pointer",
      }}
    >
      <div
        style={{
          position: "relative",

          flex:
            primary
              ? "0 0 135px"
              : "0 0 92px",

          height:
            primary
              ? 76
              : 55,

          overflow: "hidden",

          background:
            "#181b22",

          borderRadius:
            primary
              ? "12px 0 0 12px"
              : 9,
        }}
      >
        {thumbnail && (
          <img
            src={thumbnail}
            alt=""
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}

        <div
          style={{
            position:
              "absolute",

            inset: 0,

            display: "flex",

            justifyContent:
              "center",

            alignItems:
              "center",

            background:
              thumbnail
                ? "rgba(0,0,0,0.2)"
                : "transparent",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,

              display: "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              paddingLeft: 2,

              borderRadius: 999,

              background:
                "rgba(255,255,255,0.92)",

              color: "#090a0d",

              fontSize: 14,

              fontWeight: 900,
            }}
          >
            ▶
          </div>
        </div>
      </div>

      <div
        style={{
          flex: 1,

          paddingRight:
            primary
              ? 10
              : 2,

          minWidth: 0,
        }}
      >
        <div
          style={{
            display:
              "-webkit-box",

            WebkitLineClamp: 2,

            WebkitBoxOrient:
              "vertical",

            overflow: "hidden",

            fontSize:
              primary
                ? 12
                : 11,

            lineHeight: 1.3,

            fontWeight: 700,
          }}
        >
          {video?.title ||
            "Video oficial"}
        </div>

        {video?.channel && (
          <div
            style={{
              marginTop: 4,

              overflow:
                "hidden",

              whiteSpace:
                "nowrap",

              textOverflow:
                "ellipsis",

              fontSize: 9,

              opacity: 0.45,
            }}
          >
            {video.channel}
          </div>
        )}
      </div>
    </button>
  );
}
