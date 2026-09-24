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
   RESOLUCIÓN INTERNA POR CALIDAD

   OBJETIVO:
   - evitar dientes de sierra exagerados
   - LOW sigue siendo ligero, pero ya no destruye la imagen
   - MEDIUM recupera resolución prácticamente nativa
   - HIGH conserva buena nitidez
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

export default function WorldScene() {
  const [
    nearbyGame,
    setNearbyGame,
  ] = useState(null);

  const [
    openedGame,
    setOpenedGame,
  ] = useState(null);

  const [
    quality,
    setQuality,
  ] = useState("medium");

  const [
    stats,
    setStats,
  ] = useState(null);

  const [
    showStats,
    setShowStats,
  ] = useState(false);

  const [
    showTutorial,
    setShowTutorial,
  ] = useState(false);

  const [
    mobile,
    setMobile,
  ] = useState(false);

  const [
    deviceReady,
    setDeviceReady,
  ] = useState(false);

  const [
    skyTestHour,
    setSkyTestHour,
  ] = useState(null);

  const overlayOpen =
    Boolean(openedGame);

  /* =======================================================
     DETECTAR MÓVIL / DESKTOP
  ======================================================= */

  useEffect(() => {
    const coarse =
      window.matchMedia(
        "(pointer: coarse)"
      ).matches;

    setMobile(coarse);

    /*
      MÓVIL:
      arrancamos directamente LOW.

      PC:
      arrancamos HIGH.

      El PerformanceMonitor puede bajar/subir
      posteriormente según rendimiento real.
    */

    setQuality(
      coarse
        ? "low"
        : "high"
    );

    setDeviceReady(true);

    const completed =
      window.localStorage
        .getItem(
          "freakyWorldTutorialCompleted"
        );

    if (
      completed === "true"
    ) {
      return;
    }

    setShowTutorial(true);

    const timer =
      window.setTimeout(
        () => {
          setShowTutorial(false);

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

  /* =======================================================
     CERRAR TUTORIAL
  ======================================================= */

  const closeTutorial =
    useCallback(() => {
      setShowTutorial(false);

      window.localStorage
        .setItem(
          "freakyWorldTutorialCompleted",
          "true"
        );
    }, []);

  /* =======================================================
     EVENTOS 3D
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

        setNearbyGame(null);
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

      playerInput.x = 0;
      playerInput.y = 0;

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
      playerInput.x = 0;
      playerInput.y = 0;

      playerInput
        .dashRequested =
        false;

      setOpenedGame(null);
    }, []);

  /* =======================================================
     TECLADO
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

  /* =======================================================
     CIELO
  ======================================================= */

  const skyLabel =
    skyTestHour === null
      ? "REAL"
      : `${String(
          skyTestHour
        ).padStart(
          2,
          "0"
        )}:00`;

  /* =======================================================
     ESPERAMOS A SABER QUÉ DISPOSITIVO ES
  ======================================================= */

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

                      Doble toque para sprint
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
          BOTÓN FPS
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
            }}
          >
            FPS
          </button>

          {/* ===============================================
              PANEL FPS
          =============================================== */}

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
                    "rgba(0,0,0,0.76)",

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

                DPR:{" "}
                {
                  DPR_BY_QUALITY[
                    quality
                  ]
                }

                <br />

                Quality:{" "}
                {quality.toUpperCase()}

                {/* =========================================
                    CONTROL CIELO
                ========================================= */}

                <div
                  style={{
                    marginTop:
                      10,

                    paddingTop:
                      8,

                    borderTop:
                      "1px solid rgba(255,255,255,0.15)",
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
                    (hour) => {
                      const active =
                        skyTestHour ===
                        hour;

                      return (
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

                            border:
                              "1px solid rgba(255,255,255,0.16)",

                            borderRadius:
                              5,

                            background:
                              active
                                ? "#fff"
                                : "rgba(255,255,255,0.07)",

                            color:
                              active
                                ? "#111"
                                : "#fff",

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
                      );
                    }
                  )}
                </div>
              </div>
            )}
        </>
      )}

      {/* ===================================================
          CANVAS 3D

          IMPORTANTE:
          MSAA ACTIVADO.

          Antes:
          antialias: false

          Ahora:
          antialias: true

          Recuperamos bordes suaves sin aumentar
          geometría, sombras ni cantidad de luces.
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
        {/* =================================================
            MONITOR DE RENDIMIENTO
        ================================================= */}

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

        {/* =================================================
            CIELO DINÁMICO
        ================================================= */}

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

        {/* =================================================
            CONFIGURACIÓN GENERAL DEL RENDERER
        ================================================= */}

        <WorldLighting />

        {/* =================================================
            ILUMINACIÓN ADAPTATIVA

            - iluminación nocturna global barata
            - luz local por proximidad
            - sombra local por zona
        ================================================= */}

        <AdaptiveWorldLighting
          quality={
            quality
          }
          testHour={
            skyTestHour
          }
        />

        {/* =================================================
            FÍSICA
        ================================================= */}

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
          INTERACCIÓN CON JUEGO
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
              {nearbyGame.title}
            </span>

            <small>
              E
            </small>
          </button>
        )}

      {/* ===================================================
          FICHA 2D
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
