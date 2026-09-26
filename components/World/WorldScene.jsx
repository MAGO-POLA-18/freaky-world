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
import YouTubeScreen3D from "./YouTubeScreen3D";

import {
  FEATURED_VIDEO_URL,
} from "./featuredVideoConfig";

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
  const youtubeScreenRef =
    useRef(null);

  const css3dPortalRef =
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
    useState(
      "medium"
    );

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

  const [
    videoCurrentTime,
    setVideoCurrentTime,
  ] =
    useState(0);

  const [
    videoDuration,
    setVideoDuration,
  ] =
    useState(0);

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
      window
        .matchMedia(
          "(pointer: coarse)"
        )
        .matches;

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
     TUTORIAL
  ======================================================= */

  const closeTutorial =
    useCallback(
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
      []
    );

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
            event.detail.game
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
     PLAY / PAUSA
  ======================================================= */

  const toggleWorldVideo =
    useCallback(
      () => {
        setVideoError(
          false
        );

        if (
          videoWallPlaying
        ) {
          youtubeScreenRef.current
            ?.pause?.();

          return;
        }

        youtubeScreenRef.current
          ?.play?.();
      },
      [
        videoWallPlaying,
      ]
    );

  const pauseWorldVideo =
    useCallback(
      () => {
        youtubeScreenRef.current
          ?.pause?.();
      },
      []
    );

  /* =======================================================
     SEEK
  ======================================================= */

  const seekWorldVideoBy =
    useCallback(
      (
        seconds
      ) => {
        youtubeScreenRef.current
          ?.seekBy?.(
            seconds
          );
      },
      []
    );

  const seekWorldVideoTo =
    useCallback(
      (
        value
      ) => {
        youtubeScreenRef.current
          ?.seekTo?.(
            value
          );
      },
      []
    );

  /* =======================================================
     ESTADO DEL PLAYER
  ======================================================= */

  const handleVideoPlayingChange =
    useCallback(
      (
        playing
      ) => {
        setVideoWallPlaying(
          Boolean(
            playing
          )
        );

        if (
          playing
        ) {
          setVideoError(
            false
          );
        }
      },
      []
    );

  const handleVideoTimeChange =
    useCallback(
      (
        {
          currentTime,
          duration,
        }
      ) => {
        setVideoCurrentTime(
          Number.isFinite(
            currentTime
          )
            ? currentTime
            : 0
        );

        setVideoDuration(
          Number.isFinite(
            duration
          )
            ? duration
            : 0
        );
      },
      []
    );

  const handleVideoError =
    useCallback(
      (
        error
      ) => {
        console.error(
          "FREAKY YOUTUBE PLAYER ERROR:",
          error
        );

        setVideoError(
          true
        );

        setVideoWallPlaying(
          false
        );
      },
      []
    );

  /* =======================================================
     ABRIR 2D
  ======================================================= */

  const openGame =
    useCallback(
      () => {
        if (
          !nearbyGame?.id ||
          overlayOpen
        ) {
          return;
        }

        /*
          Pausamos el mismo video
          antes de abrir el 2D.
        */

        if (
          nearbyGame.id ===
          "featured-video-screen"
        ) {
          pauseWorldVideo();
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
      },
      [
        nearbyGame,
        overlayOpen,
        pauseWorldVideo,
      ]
    );

  const closeGame =
    useCallback(
      () => {
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
      },
      []
    );

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

  /* =======================================================
     TIEMPO
  ======================================================= */

  const formatVideoTime =
    useCallback(
      (
        value
      ) => {
        const safe =
          Number.isFinite(
            value
          )
            ? Math.max(
                0,
                Math.floor(
                  value
                )
              )
            : 0;

        const minutes =
          Math.floor(
            safe /
              60
          );

        const seconds =
          safe %
          60;

        return `${minutes}:${String(
          seconds
        ).padStart(
          2,
          "0"
        )}`;
      },
      []
    );

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

  if (
    !deviceReady
  ) {
    return null;
  }

  return (
    <>
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
                {quality
                  .toUpperCase()}

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
                  {SKY_TEST_HOURS
                    .map(
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
          CAPA CSS3D
      =================================================== */}

      <div
        ref={
          css3dPortalRef
        }
        style={{
          position:
            "fixed",

          inset:
            0,

          zIndex:
            20,

          pointerEvents:
            "none",

          overflow:
            "hidden",
        }}
      />

      {/* ===================================================
          MUNDO WEBGL
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
            1 /
            60
          }
        >
          <WorldEnvironment />

          <PlayerController />

          <CameraRig />
        </Physics>

        {/* ===============================================
            YOUTUBE COMO OBJETO 3D REAL
        =============================================== */}

        <YouTubeScreen3D
          ref={
            youtubeScreenRef
          }
          url={
            FEATURED_VIDEO_URL
          }
          portalRef={
            css3dPortalRef
          }
          visible={
            !overlayOpen
          }
          onPlayingChange={
            handleVideoPlayingChange
          }
          onTimeChange={
            handleVideoTimeChange
          }
          onError={
            handleVideoError
          }
        />
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
              {
                nearbyGame.title
              }
            </span>

            <small>
              E
            </small>
          </button>
        )}

      {/* ===================================================
          CONTROLES VIDEO
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
                  ? 18
                  : 28,

              transform:
                "translateX(-50%)",

              zIndex:
                60,

              display:
                "flex",

              flexWrap:
                "wrap",

              alignItems:
                "center",

              justifyContent:
                "center",

              gap:
                8,

              width:
                "min(96vw,760px)",

              padding:
                10,

              borderRadius:
                18,

              background:
                "rgba(5,8,12,.78)",

              backdropFilter:
                "blur(14px)",

              border:
                "1px solid rgba(255,255,255,.14)",

              pointerEvents:
                "auto",
            }}
          >
            <button
              type="button"
              onClick={() =>
                seekWorldVideoBy(
                  -10
                )
              }
              style={
                videoButtonStyle
              }
            >
              −10 s
            </button>

            <button
              type="button"
              onClick={
                toggleWorldVideo
              }
              style={{
                ...videoButtonStyle,

                minWidth:
                  138,

                border:
                  videoError
                    ? "1px solid #ff4b4b"
                    : "1px solid rgba(255,255,255,.24)",

                background:
                  videoWallPlaying
                    ? "rgba(145,20,35,.95)"
                    : "rgba(8,18,23,.96)",
              }}
            >
              {videoError
                ? "⚠ Error de vídeo"
                : videoWallPlaying
                  ? "❚❚ Pausar"
                  : "▶ Reproducir"}
            </button>

            <button
              type="button"
              onClick={() =>
                seekWorldVideoBy(
                  10
                )
              }
              style={
                videoButtonStyle
              }
            >
              +10 s
            </button>

            <input
              type="range"
              min="0"
              max={
                videoDuration >
                0
                  ? videoDuration
                  : 1
              }
              step="0.1"
              value={
                Math.min(
                  videoCurrentTime,

                  videoDuration >
                    0
                    ? videoDuration
                    : 1
                )
              }
              onChange={
                (
                  event
                ) =>
                  seekWorldVideoTo(
                    event.target
                      .value
                  )
              }
              style={{
                flex:
                  "1 1 180px",

                maxWidth:
                  300,
              }}
            />

            <span
              style={{
                minWidth:
                  86,

                color:
                  "#fff",

                fontSize:
                  12,

                fontWeight:
                  800,

                fontVariantNumeric:
                  "tabular-nums",

                textAlign:
                  "center",
              }}
            >
              {formatVideoTime(
                videoCurrentTime
              )}

              {" / "}

              {formatVideoTime(
                videoDuration
              )}
            </span>

            <button
              type="button"
              onClick={
                openGame
              }
              style={
                videoButtonStyle
              }
            >
              ↗ Abrir en 2D
            </button>
          </div>
        )}

      {/* ===================================================
          OVERLAY 2D
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

/* =========================================================
   ESTILO BOTONES VIDEO
========================================================= */

const videoButtonStyle = {
  minHeight:
    46,

  padding:
    "8px 12px",

  border:
    "1px solid rgba(255,255,255,.2)",

  borderRadius:
    12,

  background:
    "rgba(255,255,255,.08)",

  color:
    "#fff",

  fontSize:
    14,

  fontWeight:
    850,

  touchAction:
    "manipulation",
};
