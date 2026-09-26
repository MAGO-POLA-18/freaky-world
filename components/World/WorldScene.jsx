"use client";

import {
  useCallback,
  useEffect,
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
     ESTADO VIDEO
  ======================================================= */

  useEffect(() => {
    const handleVideoState =
      (
        event
      ) => {
        setVideoWallPlaying(
          Boolean(
            event.detail
              ?.playing
          )
        );
      };

    window.addEventListener(
      "freaky:video-wall-state",
      handleVideoState
    );

    return () => {
      window.removeEventListener(
        "freaky:video-wall-state",
        handleVideoState
      );
    };
  }, []);

  /* =======================================================
     PLAY / STOP EN EL MUNDO
  ======================================================= */

  const toggleWorldVideo =
    useCallback(() => {
      window.dispatchEvent(
        new CustomEvent(
          "freaky:video-wall-toggle"
        )
      );
    }, []);

  const stopWorldVideo =
    useCallback(() => {
      window.dispatchEvent(
        new CustomEvent(
          "freaky:video-wall-stop"
        )
      );
    }, []);

  /* =======================================================
     ABRIR FICHA / VIDEO 2D
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
        Si estaba reproduciendo
        en el mundo, lo detenemos
        antes de abrir 2D.
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
                FPS: {stats.fps}

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

          fov: 60,

          near: 0.1,

          far: 420,
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
          INTERACCIÓN NORMAL DE JUEGO
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
          CONTROLES DE VIDEO

          DOS BOTONES
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

              alignItems:
                "center",

              justifyContent:
                "center",

              gap:
                8,

              width:
                "min(94vw,500px)",
            }}
          >
            {/* PLAY / STOP */}

            <button
              type="button"
              onClick={
                toggleWorldVideo
              }
              style={{
                minHeight:
                  52,

                padding:
                  "10px 15px",

                border:
                  "1px solid rgba(255,255,255,.24)",

                borderRadius:
                  15,

                background:
                  videoWallPlaying
                    ? "rgba(145,20,35,.92)"
                    : "rgba(8,18,23,.94)",

                color:
                  "#fff",

                fontSize:
                  14,

                fontWeight:
                  800,

                backdropFilter:
                  "blur(14px)",
              }}
            >
              {videoWallPlaying
                ? "■ Detener"
                : "▶ Reproducir"}
            </button>

            {/* ABRIR 2D */}

            <button
              type="button"
              onClick={
                openGame
              }
              style={{
                minHeight:
                  52,

                padding:
                  "10px 15px",

                border:
                  "1px solid rgba(255,255,255,.24)",

                borderRadius:
                  15,

                background:
                  "rgba(8,18,23,.94)",

                color:
                  "#fff",

                fontSize:
                  14,

                fontWeight:
                  800,

                backdropFilter:
                  "blur(14px)",
              }}
            >
              ↗ Abrir en 2D
            </button>
          </div>
        )}

      {/* ===================================================
          OVERLAY
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
