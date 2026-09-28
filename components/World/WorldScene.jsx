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
import FullGameOverlay from "./FullGameOverlay";
import VideoOverlay from "./VideoOverlay";
import PerformanceMonitor from "./PerformanceMonitor";
import GameSearchOverlay from "./GameSearchOverlay";

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
  ] = useState(null);

  const [
    openedGame,
    setOpenedGame,
  ] = useState(null);

  /*
    Juego que se está mostrando
    en la ficha completa.

    Es independiente de openedGame
    para poder alternar:

    ficha rápida
        ↓
    ficha completa
        ↓
    ficha rápida
  */

  const [
    fullGame,
    setFullGame,
  ] = useState(null);

  /*
    Buscador global de Tierra Vicio.

    Vive como interfaz 2D por encima
    del Canvas para no añadir carga
    innecesaria al mundo 3D.
  */

  const [
    searchOpen,
    setSearchOpen,
  ] = useState(false);

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

  /*
    El mundo se considera bloqueado
    con cualquier interfaz que requiera
    interacción exclusiva:

    - ficha rápida
    - ficha completa
    - buscador
  */

  const overlayOpen =
    Boolean(
      openedGame ||
      fullGame ||
      searchOpen
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

    setMobile(coarse);

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
      completed ===
      "true"
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

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  /* =======================================================
     TUTORIAL
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
     OBJETO CERCANO
  ======================================================= */

  useEffect(() => {
    const handleGameNear = (
      event
    ) => {
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
     ABRIR FICHA COMPLETA
  ======================================================= */

  useEffect(() => {
    const handleOpenFullGame = (
      event
    ) => {
      const game =
        event.detail?.game;

      if (!game?.id) {
        return;
      }

      playerInput.x = 0;
      playerInput.y = 0;

      playerInput.dashRequested =
        false;

      setSearchOpen(false);
      setFullGame(game);
    };

    window.addEventListener(
      "freaky:open-full-game",
      handleOpenFullGame
    );

    return () => {
      window.removeEventListener(
        "freaky:open-full-game",
        handleOpenFullGame
      );
    };
  }, []);

  /* =======================================================
     BUSCADOR GLOBAL
  ======================================================= */

  const openSearch =
    useCallback(() => {
      if (
        openedGame ||
        fullGame
      ) {
        return;
      }

      playerInput.x = 0;
      playerInput.y = 0;

      playerInput.dashRequested =
        false;

      setShowTutorial(false);
      setSearchOpen(true);
    }, [
      openedGame,
      fullGame,
    ]);

  const closeSearch =
    useCallback(() => {
      playerInput.x = 0;
      playerInput.y = 0;

      playerInput.dashRequested =
        false;

      setSearchOpen(false);
    }, []);

  const selectSearchGame =
    useCallback(
      (game) => {
        if (!game?.id) {
          return;
        }

        playerInput.x = 0;
        playerInput.y = 0;

        playerInput.dashRequested =
          false;

        setSearchOpen(false);
        setOpenedGame(null);
        setFullGame(game);
      },
      []
    );

  /* =======================================================
     ABRIR 2D DESDE EL MUNDO
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

      playerInput.dashRequested =
        false;

      setSearchOpen(false);
      setFullGame(null);

      setOpenedGame(
        nearbyGame
      );
    }, [
      nearbyGame,
      overlayOpen,
    ]);

  /* =======================================================
     CERRAR TODO Y VOLVER AL MUNDO
  ======================================================= */

  const closeGame =
    useCallback(() => {
      playerInput.x = 0;
      playerInput.y = 0;

      playerInput.dashRequested =
        false;

      setSearchOpen(false);
      setFullGame(null);
      setOpenedGame(null);
    }, []);

  /* =======================================================
     VOLVER DE FICHA COMPLETA
  ======================================================= */

  const backToQuickGame =
    useCallback(() => {
      playerInput.x = 0;
      playerInput.y = 0;

      playerInput.dashRequested =
        false;

      setFullGame(null);
    }, []);

  /* =======================================================
     TECLADO
  ======================================================= */

  useEffect(() => {
    const handleKey = (
      event
    ) => {
      if (searchOpen) {
        return;
      }

      if (
        event.code ===
          "Escape" &&
        (
          openedGame ||
          fullGame
        )
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

        return;
      }

      if (
        event.code ===
          "KeyF" &&
        !overlayOpen
      ) {
        const target =
          event.target;

        const editing =
          target instanceof
            HTMLInputElement ||
          target instanceof
            HTMLTextAreaElement ||
          target?.isContentEditable;

        if (!editing) {
          event.preventDefault();
          openSearch();

          return;
        }
      }

      if (
        event.code ===
          "KeyP" &&
        !overlayOpen
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
    openedGame,
    fullGame,
    searchOpen,
    overlayOpen,
    openGame,
    openSearch,
    closeGame,
  ]);

  /* =======================================================
     CIELO
  ======================================================= */

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

                      Toca las pantallas para interactuar
                    </>
                  ) : (
                    <>
                      WASD para caminar
                      <br />

                      Arrastra para mirar
                      <br />

                      E para abrir en 2D
                      <br />

                      F para buscar juegos
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

                  cursor:
                    "pointer",
                }}
              >
                ×
              </button>
            </div>
          </div>
        )}

      {/* ===================================================
          BOTÓN BUSCADOR GLOBAL
      =================================================== */}

      {!overlayOpen && (
        <button
          type="button"
          aria-label="Buscar juegos"
          onClick={
            openSearch
          }
          style={{
            position:
              "fixed",

            top:
              14,

            right:
              mobile
                ? 62
                : 70,

            zIndex:
              80,

            width:
              38,

            height:
              34,

            display:
              "grid",

            placeItems:
              "center",

            padding:
              0,

            border:
              "1px solid rgba(255,255,255,.14)",

            borderRadius:
              9,

            background:
              "rgba(0,0,0,.48)",

            backdropFilter:
              "blur(8px)",

            color:
              "#fff",

            fontSize:
              19,

            fontWeight:
              800,

            cursor:
              "pointer",

            touchAction:
              "manipulation",
          }}
        >
          ⌕
        </button>
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
                (current) =>
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

              cursor:
                "pointer",
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
                    (hour) => (
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

                          cursor:
                            "pointer",
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
          MUNDO 3D
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
            true,

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

          MÓVIL:
          Botón compacto en el lateral derecho,
          ligeramente por debajo del centro.

          PC:
          Conserva la clase y posición originales.
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
            style={
              mobile
                ? {
                    position:
                      "fixed",

                    right:
                      16,

                    top:
                      "58%",

                    transform:
                      "translateY(-50%)",

                    zIndex:
                      90,

                    width:
                      "auto",

                    maxWidth:
                      150,

                    minHeight:
                      42,

                    padding:
                      "8px 11px",

                    display:
                      "flex",

                    alignItems:
                      "center",

                    justifyContent:
                      "center",

                    gap:
                      6,

                    border:
                      "1px solid rgba(255,255,255,.22)",

                    borderRadius:
                      12,

                    background:
                      "rgba(5,8,12,.82)",

                    backdropFilter:
                      "blur(10px)",

                    WebkitBackdropFilter:
                      "blur(10px)",

                    color:
                      "#fff",

                    fontSize:
                      11,

                    fontWeight:
                      800,

                    lineHeight:
                      1.15,

                    textAlign:
                      "left",

                    boxShadow:
                      "0 6px 20px rgba(0,0,0,.28)",

                    cursor:
                      "pointer",

                    touchAction:
                      "manipulation",

                    userSelect:
                      "none",

                    WebkitUserSelect:
                      "none",
                  }
                : undefined
            }
          >
            <span
              className="world-interaction-icon"
              style={
                mobile
                  ? {
                      flex:
                        "0 0 auto",

                      width:
                        24,

                      height:
                        24,

                      display:
                        "grid",

                      placeItems:
                        "center",

                      borderRadius:
                        7,

                      background:
                        "rgba(255,255,255,.1)",

                      fontSize:
                        14,
                    }
                  : undefined
              }
            >
              ↗
            </span>

            <span
              style={
                mobile
                  ? {
                      display:
                        "block",

                      maxWidth:
                        90,

                      overflow:
                        "hidden",

                      whiteSpace:
                        "nowrap",

                      textOverflow:
                        "ellipsis",
                    }
                  : undefined
              }
            >
              Abrir{" "}
              {nearbyGame.title}
            </span>

            {!mobile && (
              <small>
                E
              </small>
            )}
          </button>
        )}

      {/* ===================================================
          PANTALLA VIDEO
      =================================================== */}

      {isVideoWall &&
        !overlayOpen && (
          <button
            type="button"
            onClick={
              openGame
            }
            style={{
              position:
                "fixed",

              top:
                mobile
                  ? 72
                  : 64,

              right:
                mobile
                  ? 12
                  : 72,

              zIndex:
                90,

              minHeight:
                38,

              padding:
                "7px 12px",

              border:
                "1px solid rgba(255,255,255,.22)",

              borderRadius:
                11,

              background:
                "rgba(5,8,12,.84)",

              backdropFilter:
                "blur(10px)",

              color:
                "#fff",

              fontSize:
                12,

              fontWeight:
                850,

              cursor:
                "pointer",

              touchAction:
                "manipulation",
            }}
          >
            ↗ Abrir en 2D
          </button>
        )}

      {/* ===================================================
          BUSCADOR GLOBAL
      =================================================== */}

      <GameSearchOverlay
        open={
          searchOpen
        }
        onClose={
          closeSearch
        }
        onSelectGame={
          selectSearchGame
        }
      />

      {/* ===================================================
          OVERLAYS 2D
      =================================================== */}

      {fullGame ? (
        <FullGameOverlay
          game={fullGame}
          onClose={closeGame}
          onBack={
            backToQuickGame
          }
        />
      ) : openedGame?.overlayType ===
        "video" ? (
        <VideoOverlay
          video={openedGame}
          onClose={closeGame}
        />
      ) : openedGame ? (
        <RankingOverlay
          game={openedGame}
          onClose={closeGame}
        />
      ) : null}
    </>
  );
}
