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

import PlayerController, {
  playerInput,
} from "./PlayerController";

import CameraRig from "./CameraRig";
import MobileControls from "./MobileControls";
import RankingOverlay from "./RankingOverlay";
import PerformanceMonitor from "./PerformanceMonitor";

/* =========================================================
   DPR POR CALIDAD
========================================================= */

const DPR_BY_QUALITY = {
  low: [
    0.7,
    0.9,
  ],

  medium: [
    0.85,
    1.1,
  ],

  high: [
    1,
    1.35,
  ],
};

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
      "high"
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

  const overlayOpen =
    Boolean(
      openedGame
    );

  /* =======================================================
     TUTORIAL
  ======================================================= */

  useEffect(() => {
    const coarse =
      window.matchMedia(
        "(pointer: coarse)"
      ).matches;

    setMobile(
      coarse
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

    return () =>
      window.clearTimeout(
        timer
      );
  }, []);

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
     EVENTO DESDE 3D
  ======================================================= */

  useEffect(() => {
    const handleGameNear =
      (event) => {
        if (
          event.detail?.near &&
          event.detail?.game
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
     ABRIR FICHA
  ======================================================= */

  const openGame =
    useCallback(() => {
      if (
        !nearbyGame?.id ||
        overlayOpen
      ) {
        return;
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
    ]);

  /* =======================================================
     CERRAR FICHA
  ======================================================= */

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
     TECLADO GENERAL
  ======================================================= */

  useEffect(() => {
    const handleKey =
      (event) => {
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

          openGame();
        }

        if (
          event.code ===
          "KeyP"
        ) {
          setShowStats(
            (current) =>
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
  ]);

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
                "min(90vw, 390px)",

              padding:
                "14px 16px",

              borderRadius:
                16,

              color:
                "#fff",

              background:
                "rgba(5,8,12,0.82)",

              backdropFilter:
                "blur(14px)",

              border:
                "1px solid rgba(255,255,255,0.15)",

              boxShadow:
                "0 10px 30px rgba(0,0,0,0.25)",

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
                      Joystick para moverte
                      <br />
                      Desliza para mirar
                      <br />
                      Doble toque para sprint
                    </>
                  ) : (
                    <>
                      WASD para caminar
                      <br />
                      Doble W para sprint
                      <br />
                      Ctrl para correr · Arrastra para mirar
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

                  flex:
                    "0 0 auto",

                  border:
                    0,

                  borderRadius:
                    "50%",

                  background:
                    "rgba(255,255,255,0.1)",

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
          DIAGNÓSTICO
      =================================================== */}

      {!overlayOpen && (
        <>
          <button
            type="button"
            onClick={() =>
              setShowStats(
                (value) =>
                  !value
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
                "1px solid rgba(255,255,255,0.14)",

              borderRadius:
                9,

              background:
                "rgba(0,0,0,0.48)",

              color:
                "#fff",

              fontSize:
                11,

              fontWeight:
                800,

              backdropFilter:
                "blur(10px)",
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

                  minWidth:
                    150,

                  padding:
                    "10px 12px",

                  borderRadius:
                    10,

                  background:
                    "rgba(0,0,0,0.72)",

                  color:
                    "#fff",

                  fontFamily:
                    "monospace",

                  fontSize:
                    11,

                  lineHeight:
                    1.55,

                  pointerEvents:
                    "none",
                }}
              >
                FPS:{" "}
                {stats.fps}
                <br />

                Frame:{" "}
                {stats.frameMs}
                ms
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
              </div>
            )}
        </>
      )}

      {/* ===================================================
          WORLD
      =================================================== */}

      <Canvas
        shadows
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

          near:
            0.1,

          far:
            600,
        }}
        gl={{
          antialias:
            true,

          powerPreference:
            "high-performance",
        }}
      >
        <PerformanceMonitor
          onStats={
            setStats
          }
          onQualityChange={
            setQuality
          }
        />

        <DynamicSky />

        <WorldLighting />

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
          MOBILE
      =================================================== */}

      {!overlayOpen && (
        <MobileControls />
      )}

      {/* ===================================================
          INTERACCIÓN
      =================================================== */}

      {nearbyGame &&
        !overlayOpen && (
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
