"use client";

import { useEffect, useMemo } from "react";

function getYouTubeId(url) {
  if (!url) return null;

  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname
        .replace("/", "")
        .split("/")[0];
    }

    if (parsed.pathname.startsWith("/shorts/")) {
      return parsed.pathname
        .split("/shorts/")[1]
        ?.split("/")[0];
    }

    if (parsed.pathname.startsWith("/embed/")) {
      return parsed.pathname
        .split("/embed/")[1]
        ?.split("/")[0];
    }

    return parsed.searchParams.get("v");
  } catch {
    return null;
  }
}

export default function VideoOverlay({
  video,
  onClose,
}) {
  const youtubeId =
    useMemo(
      () =>
        getYouTubeId(
          video?.youtubeUrl ||
          video?.videoUrl
        ),
      [
        video?.youtubeUrl,
        video?.videoUrl,
      ]
    );

  useEffect(() => {
    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    const handleKeyDown = (
      event
    ) => {
      if (
        event.code ===
        "Escape"
      ) {
        onClose?.();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [onClose]);

  if (
    !video ||
    !youtubeId
  ) {
    return null;
  }

  const embedUrl =
    `https://www.youtube.com/embed/${youtubeId}` +
    `?autoplay=1` +
    `&playsinline=1` +
    `&rel=0` +
    `&modestbranding=1`;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        padding:
          "max(16px, env(safe-area-inset-top)) 16px max(16px, env(safe-area-inset-bottom))",

        background:
          "rgba(0,0,0,0.88)",

        backdropFilter:
          "blur(8px)",

        WebkitBackdropFilter:
          "blur(8px)",
      }}

      onPointerDown={(
        event
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose?.();
        }
      }}
    >
      <div
        style={{
          position:
            "relative",

          width:
            "min(1200px, 96vw)",

          aspectRatio:
            "16 / 9",

          background:
            "#000",

          borderRadius:
            "18px",

          overflow:
            "hidden",

          boxShadow:
            "0 30px 100px rgba(0,0,0,0.65)",
        }}
      >
        {/* BOTÓN CERRAR */}

        <button
          type="button"

          aria-label="Cerrar video"

          onClick={onClose}

          style={{
            position:
              "absolute",

            top:
              "12px",

            right:
              "12px",

            zIndex:
              10,

            width:
              "44px",

            height:
              "44px",

            border:
              "1px solid rgba(255,255,255,0.25)",

            borderRadius:
              "999px",

            background:
              "rgba(0,0,0,0.72)",

            color:
              "#fff",

            fontSize:
              "25px",

            lineHeight:
              1,

            cursor:
              "pointer",

            WebkitTapHighlightColor:
              "transparent",
          }}
        >
          ×
        </button>

        {/* YOUTUBE */}

        <iframe
          key={youtubeId}

          src={embedUrl}

          title={
            video.title ||
            "Video Freaky World"
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
            display:
              "block",

            width:
              "100%",

            height:
              "100%",

            border:
              0,
          }}
        />
      </div>
    </div>
  );
}
