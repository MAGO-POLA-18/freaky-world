"use client";

import { useEffect, useMemo } from "react";
import { getYouTubeEmbedUrl } from "./featuredVideoConfig";

export default function VideoOverlay({
  video,
  onClose,
}) {
  const sourceUrl =
    video?.youtubeUrl ||
    video?.videoUrl ||
    null;

  const embedUrl = useMemo(
    () =>
      getYouTubeEmbedUrl(sourceUrl, {
        autoplay: true,
      }),
    [sourceUrl]
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
        event.code === "Escape"
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
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [onClose]);

  if (!video || !embedUrl) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={
        video.title ||
        "Video Freaky World"
      }
      onPointerDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose?.();
        }
      }}
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
    >
      <div
        onPointerDown={(event) =>
          event.stopPropagation()
        }
        style={{
          position: "relative",

          width:
            "min(1200px, 96vw)",

          maxHeight:
            "calc(100dvh - 32px)",

          aspectRatio: "16 / 9",

          background: "#000",

          borderRadius:
            "18px",

          overflow: "hidden",

          boxShadow:
            "0 30px 100px rgba(0,0,0,0.65)",
        }}
      >
        <iframe
          key={embedUrl}
          src={embedUrl}
          title={
            video.title ||
            "Video Freaky World"
          }
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{
            display: "block",

            width: "100%",
            height: "100%",

            border: 0,

            background: "#000",
          }}
        />

        <button
          type="button"
          aria-label="Cerrar video"
          onClick={onClose}
          style={{
            position: "absolute",

            top: "12px",
            right: "12px",

            zIndex: 10,

            width: "44px",
            height: "44px",

            border:
              "1px solid rgba(255,255,255,0.25)",

            borderRadius:
              "999px",

            background:
              "rgba(0,0,0,0.72)",

            color: "#fff",

            fontSize: "25px",
            lineHeight: 1,

            cursor: "pointer",

            WebkitTapHighlightColor:
              "transparent",
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
