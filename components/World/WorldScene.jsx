"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Canvas,
} from "@react-three/fiber";

import {
  Physics,
} from "@react-three/rapier";

import WorldEnvironment from "./WorldEnvironment";
import DynamicSky from "./DynamicSky";
import WorldLighting from "./WorldLighting";
import AdaptiveWorldLighting from "./AdaptiveWorldLighting";

import PlayerController, {
  playerInput,
} from "./PlayerController";

import CameraRig from "./CameraRig";
import MobileControls from "./MobileControls";
import RankingOverlay from "./RankingOverlay";
import PerformanceMonitor from "./PerformanceMonitor";

/* =========================================================
   VIDEO ÚNICO

   ESTE MISMO ARCHIVO LO USA:
   - el elemento VIDEO HTML
   - la textura 3D
   - la ficha 2D
========================================================= */

const FEATURED_VIDEO_URL =
  "https://media.w3.org/2010/05/sintel/trailer.mp4";

/* =========================================================
   CALIDAD
========================================================= */

const DPR_BY_QUALITY = {
  low: 0.8,
  medium: 0.95,
  high: 1.1,
};

const SKY_TEST_HOURS = [
  null,
  6,
  8,
  13,
  18,
  20,
  23,
];

/* =========================================================
   WORLD
========================================================= */

export default function WorldScene() {
  const featuredVideoRef =
    useRef(null);

  const [
    nearbyGame,
    setNearbyGame,
  ] =
    useState(null);

  const [
    openedGame,
    setOpenedGame,
  ] =
    useState(null);

  const [
    quality,
    setQuality,
  ] =
    useState("medium");

  const [
    stats,
    setStats,
  ] =
    useState(null);

  const [
    showStats,
    setShowStats,
  ] =
    useState(false);

  const [
    showTutorial,
    setShowTutorial,
  ] =
    useState(false);

  const [
    mobile,
    setMobile,
  ] =
    useState(false);

  const [
    deviceReady,
    setDeviceReady,
  ] =
    useState(false);

  const [
    skyTestHour,
    setSkyTestHour,
  ] =
    useState(null);

  const [
    videoWallPlaying,
    setVideoWallPlaying,
  ] =
    useState(false);

  const [
    videoError,
    setVideoError,
  ] =
    useState(false);

  const overlayOpen =
    Boolean(
      openedGame
    );

  const isVideoWall =
    nearbyGame?.id ===
    "featured-video-screen";

  /* =======================================================
     DEVICE
  ======================================================= */

  useEffect(() => {
    const coarse =
      window.matchMedia(
        "(pointer: coarse)"
      ).matches;

    setMobile(
      coarse
    );

    setQuality(
      coarse
        ? "low"
        : "high"
    );

    setDeviceReady(
      true
    );

    const completed =
      window.localStorage
        .getItem(
          "freakyWorldTutorialCompleted"
        );

    if (
      completed ===
      "true"
    ) {
      return;
    }

    setShowTutorial(
      true
    );

    const timer =
      window.setTimeout(
        () => {
          setShowTutorial(
            false
          );

          window.localStorage
            .setItem(
              "freakyWorldTutorialCompleted",
              "true"
            );
        },
        9000
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, []);

  /* =======================================================
     VIDEO HTML REAL

     El sonido sale de este elemento.

     La pantalla 3D utiliza exactamente
     este mismo elemento como VideoTexture.
  ======================================================= */

  useEffect(() => {
    const video =
      featuredVideoRef.current;

    if (!video) {
      return;
    }

    const handlePlay =
      () => {
        setVideoWallPlaying(
          true
        );

        setVideoError(
          false
        );
      };

    const handlePause =
      () => {
        setVideoWallPlaying(
          false
        );
      };

    const handleEnded =
      () => {
        setVideoWallPlaying(
          false
        );

        try {
          video.currentTime =
            0;
        } catch {
          // nada
        }
      };

    const handleError =
      () => {
        setVideoWallPlaying(
          false
        );

        setVideoError(
          true
        );
      };

    video.addEventListener(
      "play",
      handlePlay
    );

    video.addEventListener(
      "playing",
      handlePlay
    );

    video.addEventListener(
      "pause",
      handlePause
    );

    video.addEventListener(
      "ended",
      handleEnded
    );

    video.addEventListener(
      "error",
      handleError
    );

    return () => {
      video.removeEventListener(
        "play",
        handlePlay
      );

      video.removeEventListener(
        "playing",
        handlePlay
      );

      video.removeEventListener(
        "pause",
        handlePause
      );

      video.removeEventListener(
        "ended",
        handleEnded
      );

      video.removeEventListener(
        "error",
        handleError
      );
    };
  }, []);

  /* =======================================================
     TUTORIAL
  ======================================================= */

  const closeTutorial =
    useCallback(() => {
      setShowTutorial(
        false
      );

      window.localStorage
        .setItem(
          "freakyWorldTutorialCompleted",
          "true"
        );
    }, []);

  /* =======================================================
     OBJETO CERCANO
  ======================================================= */

  useEffect(() => {
    const handleGameNear =
      (
        event
      ) => {
        if (
          event.detail
            ?.near &&
          event.detail
            ?.game
        ) {
          setNearbyGame(
            event.detail
              .game
          );

          return;
        }

        setNearbyGame(
          null
        );
      };

    window.addEventListener(
      "freaky:game-near",
      handleGameNear
    );

    return () => {
      window.removeEventListener(
        "freaky:game-near",
        handleGameNear
      );
    };
  }, []);

  /* =======================================================
     REPRODUCIR / DETENER

     IMPORTANTE:

     video.play() ocurre DIRECTAMENTE dentro
     del click del botón HTML.

     No hay CustomEvent.
     No hay intermediarios.
  ======================================================= */

  const toggleWorldVideo =
    useCallback(
      async () => {
        const video =
          featuredVideoRef.current;

        if (!video) {
          return;
        }

        setVideoError(
          false
        );

        /*
          SI YA ESTÁ REPRODUCIENDO:
          STOP.
        */

        if (
          !video.paused &&
          !video.ended
        ) {
          video.pause();

          try {
            video.currentTime =
              0;
          } catch {
            // nada
          }

          setVideoWallPlaying(
            false
          );

          return;
        }

        /*
          REPRODUCCIÓN CON AUDIO.

          ESTA LLAMADA OCURRE DIRECTAMENTE
          DESDE EL BOTÓN DEL USUARIO.
        */

        try {
          video.muted =
            false;

          video.volume =
            1;

          await video.play();

          setVideoWallPlaying(
            true
          );
        } catch (
          error
        ) {
          console.error(
            "FREAKY DIRECT VIDEO PLAY ERROR:",
            error
          );

          setVideoError(
            true
          );

          setVideoWallPlaying(
            false
          );
        }
      },
      []
    );

  /* =======================================================
     STOP
  ======================================================= */

  const stopWorldVideo =
    useCallback(() => {
      const video =
        featuredVideoRef.current;

      if (!video) {
        return;
      }

      video.pause();

      try {
        video.currentTime =
          0;
      } catch {
        // nada
      }

      setVideoWallPlaying(
        false
      );
    }, []);

  /* =======================================================
     ABRIR 2D
  ======================================================= */

  const openGame =
    useCallback(() => {
      if (
        !nearbyGame?.id ||
        overlayOpen
      ) {
        return;
      }

      /*
        Evitamos dos audios simultáneos.
      */

      if (
        nearbyGame.id ===
        "featured-video-screen"
      ) {
        stopWorldVideo();
      }

      playerInput.x =
        0;

      playerInput.y =
        0;

      playerInput
        .dashRequested =
        false;

      setOpenedGame(
        nearbyGame
      );
    }, [
      nearbyGame,
      overlayOpen,
      stopWorldVideo,
    ]);

  const closeGame =
    useCallback(() => {
      playerInput.x =
        0;

      playerInput.y =
        0;

      playerInput
        .dashRequested =
        false;

      setOpenedGame(
        null
      );
    }, []);

  /* =======================================================
     TECLADO
  ======================================================= */

  useEffect(() => {
    const handleKey =
      (
        event
      ) => {
        if (
          event.code ===
            "Escape" &&
          overlayOpen
        ) {
          event.preventDefault();

          closeGame();

          return;
        }

        if (
          event.code ===
            "KeyE" &&
          nearbyGame &&
          !overlayOpen
        ) {
          event.preventDefault();

          if (
            nearbyGame.id ===
            "featured-video-screen"
          ) {
            toggleWorldVideo();
          } else {
            openGame();
          }
        }

        if (
          event.code ===
          "KeyP"
        ) {
          setShowStats(
            (
              current
            ) =>
              !current
          );
        }
      };

    window.addEventListener(
      "keydown",
      handleKey
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKey
      );
    };
  }, [
    nearbyGame,
    overlayOpen,
    openGame,
    closeGame,
    toggleWorldVideo,
  ]);

  const skyLabel =
    skyTestHour ===
    null
      ? "REAL"
      : `${String(
          skyTestHour
        ).padStart(
          2,
          "0"
        )}:00`;

  if (!deviceReady) {
    return null;
  }

  return (
    <>
      {/* ===================================================
          VIDEO HTML REAL

          NO USAMOS display:none.

          Lo dejamos fuera de pantalla para que
          Android/iOS sigan tratándolo como
          un elemento multimedia normal.
      =================================================== */}

      <video
        id="freaky-featured-video"
        ref={
          featuredVideoRef
        }
        src={
          FEATURED_VIDEO_URL
        }
        crossOrigin="anonymous"
        preload="auto"
        playsInline
        style={{
          position:
            "fixed",

          left:
            "-10000px",

          top:
            "-10000px",

          width:
            "2px",

          height:
            "2px",

          opacity:
            0,

          pointerEvents:
            "none",
        }}
      />

      {/* ===================================================
          TUTORIAL
      =================================================== */}

      {showTutorial &&
        !overlayOpen && (
          <div
            style={{
              position:
                "fixed",

              top:
                mobile
                  ? 18
                  : 22,

              left:
                "50%",

              transform:
                "translateX(-50%)",

              zIndex:
                70,

              width:
                "min(90vw,390px)",

              padding:
                "14px 16px",

              borderRadius:
                16,

              color:
                "#fff",

              background:
                "rgba(5,8,12,.82)",

              backdropFilter:
                "blur(14px)",

              border:
                "1px solid rgba(255,255,255,.15)",

              fontSize:
                13,
            }}
          >
            <div
              style={{
                display:
                  "flex",

                justifyContent:
                  "space-between",

                gap:
                  16,
              }}
            >
              <div>
                <strong>
                  Controles
                </strong>

                <div
                  style={{
                    marginTop:
                      6,

                    opacity:
                      0.72,

                    lineHeight:
                      1.55,
                  }}
                >
                  {mobile ? (
                    <>
                      Cruceta para moverte
                      <br />

                      Desliza para mirar
                      <br />

                      Doble toque para sprint
                    </>
                  ) : (
                    <>
                      WASD para caminar
                      <br />

                      Arrastra para mirar
                    </>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={
                  closeTutorial
                }
                style={{
                  width:
                    30,

                  height:
                    30,

                  border:
                    0,

                  borderRadius:
                    "50%",

                  background:
                    "rgba(255,255,255,.1)",

                  color:
                    "#fff",

                  fontSize:
                    20,
                }}
              >
                ×
              </button>
            </div>
          </div>
        )}

      {/* ===================================================
          FPS
      =================================================== */}

      {!overlayOpen && (
        <>
          <button
            type="button"
            onClick={() =>
              setShowStats(
                (
                  current
                ) =>
                  !current
              )
            }
            style={{
              position:
                "fixed",

              top:
                14,

              right:
                14,

              zIndex:
                80,

              padding:
                "7px 10px",

              border:
                "1px solid rgba(255,255,255,.14)",

              borderRadius:
                9,

              background:
                "rgba(0,0,0,.48)",

              color:
                "#fff",

              fontSize:
                11,

              fontWeight:
                800,
            }}
          >
            FPS
          </button>

          {showStats &&
            stats && (
              <div
                style={{
                  position:
                    "fixed",

                  top:
                    52,

                  right:
                    14,

                  zIndex:
                    80,

                  width:
                    215,

                  padding:
                    "10px 12px",

                  borderRadius:
                    10,

                  background:
                    "rgba(0,0,0,.76)",

                  color:
                    "#fff",

                  fontFamily:
                    "monospace",

                  fontSize:
                    11,

                  lineHeight:
                    1.55,
                }}
              >
                FPS:{" "}
                {stats.fps}

                <br />

                Frame:{" "}
                {stats.frameMs}ms

                <br />

                Draw calls:{" "}
                {stats.calls}

                <br />

                Triangles:{" "}
                {stats.triangles}

                <br />

                Textures:{" "}
                {stats.textures}

                <br />

                Quality:{" "}
                {quality.toUpperCase()}

                <div
                  style={{
                    marginTop:
                      10,
                  }}
                >
                  CIELO:{" "}
                  <strong>
                    {skyLabel}
                  </strong>
                </div>

                <div
                  style={{
                    display:
                      "flex",

                    flexWrap:
                      "wrap",

                    gap:
                      4,

                    marginTop:
                      5,
                  }}
                >
                  {SKY_TEST_HOURS.map(
                    (
                      hour
                    ) => (
                      <button
                        key={
                          hour ??
                          "real"
                        }
                        type="button"
                        onClick={() =>
                          setSkyTestHour(
                            hour
                          )
                        }
                        style={{
                          padding:
                            "4px 6px",

                          fontSize:
                            10,
                        }}
                      >
                        {hour ===
                        null
                          ? "REAL"
                          : `${String(
                              hour
                            ).padStart(
                              2,
                              "0"
                            )}:00`}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
        </>
      )}

      {/* ===================================================
          3D
      =================================================== */}

      <Canvas
        shadows={
          quality ===
          "high"
        }
        dpr={
          DPR_BY_QUALITY[
            quality
          ]
        }
        camera={{
          position: [
            0,
            3,
            6,
          ],

          fov:
            60,

          near:
            0.1,

          far:
            420,
        }}
        gl={{
          antialias:
            true,

          powerPreference:
            "high-performance",

          alpha:
            false,

          stencil:
            false,

          depth:
            true,
        }}
      >
        <PerformanceMonitor
          quality={
            quality
          }
          mobile={
            mobile
          }
          onStats={
            setStats
          }
          onQualityChange={
            setQuality
          }
        />

        <DynamicSky
          key={
            skyTestHour ===
            null
              ? "sky-real"
              : `sky-test-${skyTestHour}`
          }
          testHour={
            skyTestHour
          }
        />

        <WorldLighting />

        <AdaptiveWorldLighting
          quality={
            quality
          }
          testHour={
            skyTestHour
          }
        />

        <Physics
          gravity={[
            0,
            -9.81,
            0,
          ]}
          timeStep={
            1 / 60
          }
        >
          <WorldEnvironment />

          <PlayerController />

          <CameraRig />
        </Physics>
      </Canvas>

      {/* ===================================================
          CONTROLES MÓVILES
      =================================================== */}

      {!overlayOpen && (
        <MobileControls />
      )}

      {/* ===================================================
          JUEGOS NORMALES
      =================================================== */}

      {nearbyGame &&
        !overlayOpen &&
        !isVideoWall && (
          <button
            type="button"
            className="world-interaction-button"
            onClick={
              openGame
            }
          >
            <span className="world-interaction-icon">
              ↗
            </span>

            <span>
              Abrir{" "}
              {nearbyGame.title}
            </span>

            <small>
              E
            </small>
          </button>
        )}

      {/* ===================================================
          VIDEO
      =================================================== */}

      {isVideoWall &&
        !overlayOpen && (
          <div
            style={{
              position:
                "fixed",

              left:
                "50%",

              bottom:
                mobile
                  ? 24
                  : 34,

              transform:
                "translateX(-50%)",

              zIndex:
                60,

              display:
                "flex",

              gap:
                8,

              width:
                "min(94vw,500px)",

              justifyContent:
                "center",

              pointerEvents:
                "auto",
            }}
          >
            {/* REPRODUCIR */}

            <button
              type="button"
              onClick={
                toggleWorldVideo
              }
              style={{
                minHeight:
                  52,

                padding:
                  "10px 16px",

                border:
                  videoError
                    ? "1px solid #ff4b4b"
                    : "1px solid rgba(255,255,255,.24)",

                borderRadius:
                  15,

                background:
                  videoWallPlaying
                    ? "rgba(145,20,35,.95)"
                    : "rgba(8,18,23,.96)",

                color:
                  "#fff",

                fontSize:
                  14,

                fontWeight:
                  850,

                touchAction:
                  "manipulation",

                pointerEvents:
                  "auto",
              }}
            >
              {videoError
                ? "⚠ Error de vídeo"
                : videoWallPlaying
                  ? "■ Detener"
                  : "▶ Reproducir"}
            </button>

            {/* 2D */}

            <button
              type="button"
              onClick={
                openGame
              }
              style={{
                minHeight:
                  52,

                padding:
                  "10px 16px",

                border:
                  "1px solid rgba(255,255,255,.24)",

                borderRadius:
                  15,

                background:
                  "rgba(8,18,23,.96)",

                color:
                  "#fff",

                fontSize:
                  14,

                fontWeight:
                  850,

                touchAction:
                  "manipulation",

                pointerEvents:
                  "auto",
              }}
            >
              ↗ Abrir en 2D
            </button>
          </div>
        )}

      {/* ===================================================
          2D
      =================================================== */}

      {openedGame && (
        <RankingOverlay
          game={
            openedGame
          }
          onClose={
            closeGame
          }
        />
      )}
    </>
  );
}
