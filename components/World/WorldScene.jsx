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
import OrientationStabilizer from "./OrientationStabilizer";

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

import ConsoleMiniCard from "../ManufacturerHall/ConsoleMiniCard";
import PlatformGamesOverlay from "../ManufacturerHall/PlatformGamesOverlay";

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
  /* =======================================================
     JUEGOS
  ======================================================= */

  const [
    nearbyGame,
    setNearbyGame,
  ] = useState(null);

  const [
    openedGame,
    setOpenedGame,
  ] = useState(null);

  const [
    fullGame,
    setFullGame,
  ] = useState(null);

  /* =======================================================
     CONSOLAS
  ======================================================= */

  const [
    nearbyConsole,
    setNearbyConsole,
  ] = useState(null);

  const [
    openedConsole,
    setOpenedConsole,
  ] = useState(null);

  const [
    consoleGames,
    setConsoleGames,
  ] = useState(null);

  /* =======================================================
     BUSCADOR
  ======================================================= */

  const [
    searchOpen,
    setSearchOpen,
  ] = useState(false);

  /* =======================================================
     OTROS
  ======================================================= */

  const [
    quality,
    setQuality,
  ] = useState(
    "medium"
  );

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

  /* =======================================================
     CIELO
  ======================================================= */

  const [
    skyTestHour,
    setSkyTestHour,
  ] = useState(null);

  /* =======================================================
     CONTEXTOS
  ======================================================= */

  const fullGameFromConsole =
    Boolean(
      fullGame &&
      consoleGames
    );

  const fullGameFromSearch =
    Boolean(
      fullGame &&
      searchOpen &&
      !consoleGames
    );

  const overlayOpen =
    Boolean(
      openedGame ||
      fullGame ||
      searchOpen ||
      openedConsole ||
      consoleGames
    );

  /* =======================================================
   BLOQUEAR MUNDO CUANDO HAY UI ABIERTA
======================================================= */

useEffect(() => {
  playerInput.uiLocked =
    overlayOpen;

  if (overlayOpen) {
    playerInput.x = 0;
    playerInput.y = 0;
    playerInput.sprint = false;
    playerInput.dashRequested = false;
    playerInput.lookX = 0;
    playerInput.lookY = 0;
  }

  return () => {
    playerInput.uiLocked =
      false;
  };
}, [
  overlayOpen,
]);

  const isVideoWall =
    nearbyGame?.id ===
    "featured-video-screen";

  const interactionAvailable =
    Boolean(
      nearbyConsole ||
      nearbyGame
    );

  /* =======================================================
     DETENER JUGADOR
  ======================================================= */

  const stopPlayer =
    useCallback(() => {
      playerInput.x = 0;
      playerInput.y = 0;

      playerInput.sprint =
        false;

      playerInput.dashRequested =
        false;
    }, []);

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
     JUEGO CERCANO
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
     CONSOLA CERCANA
  ======================================================= */

  useEffect(() => {
    const handleConsoleNear = (
      event
    ) => {
      if (
        event.detail?.near &&
        event.detail?.console
      ) {
        setNearbyConsole(
          event.detail.console
        );

        return;
      }

      setNearbyConsole(
        null
      );
    };

    window.addEventListener(
      "freaky:console-near",
      handleConsoleNear
    );

    return () => {
      window.removeEventListener(
        "freaky:console-near",
        handleConsoleNear
      );
    };
  }, []);

  /* =======================================================
     ABRIR FICHA COMPLETA EXTERNA
  ======================================================= */

  useEffect(() => {
    const handleOpenFullGame = (
      event
    ) => {
      const game =
        event.detail?.game;

      if (
        !game?.id
      ) {
        return;
      }

      stopPlayer();

      setSearchOpen(
        false
      );

      setOpenedConsole(
        null
      );

      setConsoleGames(
        null
      );

      setOpenedGame(
        null
      );

      setFullGame(
        game
      );
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
  }, [
    stopPlayer,
  ]);

  /* =======================================================
     BUSCADOR
  ======================================================= */

  const openSearch =
    useCallback(() => {
      if (
        openedGame ||
        fullGame ||
        openedConsole ||
        consoleGames
      ) {
        return;
      }

      stopPlayer();

      setShowTutorial(
        false
      );

      setSearchOpen(
        true
      );
    }, [
      openedGame,
      fullGame,
      openedConsole,
      consoleGames,
      stopPlayer,
    ]);

  const closeSearch =
    useCallback(() => {
      stopPlayer();

      setSearchOpen(
        false
      );
    }, [
      stopPlayer,
    ]);

  /* =======================================================
     JUEGO DESDE BUSCADOR
  ======================================================= */

  const selectSearchGame =
    useCallback(
      (
        game
      ) => {
        if (
          !game?.id
        ) {
          return;
        }

        stopPlayer();

        setOpenedGame(
          null
        );

        setOpenedConsole(
          null
        );

        setConsoleGames(
          null
        );

        /*
          searchOpen se mantiene
          para conservar el buscador debajo.
        */

        setFullGame(
          game
        );
      },
      [
        stopPlayer,
      ]
    );

  /* =======================================================
     ABRIR JUEGO DEL MUNDO
  ======================================================= */

  const openGame =
    useCallback(() => {
      if (
        !nearbyGame?.id ||
        overlayOpen
      ) {
        return;
      }

      stopPlayer();

      setSearchOpen(
        false
      );

      setFullGame(
        null
      );

      setOpenedConsole(
        null
      );

      setConsoleGames(
        null
      );

      setOpenedGame(
        nearbyGame
      );
    }, [
      nearbyGame,
      overlayOpen,
      stopPlayer,
    ]);

  /* =======================================================
     ABRIR CONSOLA
  ======================================================= */

  const openConsole =
    useCallback(() => {
      if (
        !nearbyConsole?.id ||
        overlayOpen
      ) {
        return;
      }

      stopPlayer();

      setShowTutorial(
        false
      );

      setOpenedGame(
        null
      );

      setFullGame(
        null
      );

      setSearchOpen(
        false
      );

      setConsoleGames(
        null
      );

      setOpenedConsole(
        nearbyConsole
      );
    }, [
      nearbyConsole,
      overlayOpen,
      stopPlayer,
    ]);

  /* =======================================================
     BOTÓN A MÓVIL

     MobileControls dispara:
     freaky:interact

     Acá decidimos qué abrir.
  ======================================================= */

  useEffect(() => {
    const handleInteract =
      () => {
        if (
          overlayOpen
        ) {
          return;
        }

        if (
          nearbyConsole
        ) {
          openConsole();
          return;
        }

        if (
          nearbyGame
        ) {
          openGame();
        }
      };

    window.addEventListener(
      "freaky:interact",
      handleInteract
    );

    return () => {
      window.removeEventListener(
        "freaky:interact",
        handleInteract
      );
    };
  }, [
    overlayOpen,
    nearbyConsole,
    nearbyGame,
    openConsole,
    openGame,
  ]);

  /* =======================================================
     CATÁLOGO CONSOLA
  ======================================================= */

  const openConsoleGames =
    useCallback(
      (
        consoleData
      ) => {
        if (
          !consoleData
        ) {
          return;
        }

        stopPlayer();

        setOpenedConsole(
          null
        );

        setConsoleGames(
          consoleData
        );
      },
      [
        stopPlayer,
      ]
    );

  const closeConsoleGames =
    useCallback(() => {
      stopPlayer();

      const consoleData =
        consoleGames;

      setFullGame(
        null
      );

      setConsoleGames(
        null
      );

      if (
        consoleData
      ) {
        setOpenedConsole(
          consoleData
        );
      }
    }, [
      consoleGames,
      stopPlayer,
    ]);

  /* =======================================================
     CONSOLA — FUTURO
  ======================================================= */

  const openFullConsole =
    useCallback(
      (
        consoleData
      ) => {
        console.log(
          "Abrir ficha completa de consola:",
          consoleData
        );
      },
      []
    );

  const openConsoleVideo =
    useCallback(
      (
        video
      ) => {
        console.log(
          "Abrir video de consola:",
          video
        );
      },
      []
    );

  /* =======================================================
     JUEGO DESDE CATÁLOGO CONSOLA
  ======================================================= */

  const openGameFromConsole =
    useCallback(
      (
        game
      ) => {
        if (
          !game?.id
        ) {
          return;
        }

        stopPlayer();

        setOpenedConsole(
          null
        );

        setOpenedGame(
          null
        );

        setFullGame(
          game
        );
      },
      [
        stopPlayer,
      ]
    );

  /* =======================================================
     ATRÁS FULL GAME
  ======================================================= */

  const backFromFullGame =
    useCallback(() => {
      stopPlayer();

      if (
        fullGameFromConsole
      ) {
        setFullGame(
          null
        );

        return;
      }

      if (
        fullGameFromSearch
      ) {
        setFullGame(
          null
        );

        return;
      }

      setFullGame(
        null
      );
    }, [
      fullGameFromConsole,
      fullGameFromSearch,
      stopPlayer,
    ]);

  /* =======================================================
     CERRAR FULL GAME
  ======================================================= */

  const closeFullGame =
    useCallback(() => {
      stopPlayer();

      if (
        fullGameFromConsole
      ) {
        setFullGame(
          null
        );

        return;
      }

      if (
        fullGameFromSearch
      ) {
        setFullGame(
          null
        );

        return;
      }

      setFullGame(
        null
      );

      setOpenedGame(
        null
      );
    }, [
      fullGameFromConsole,
      fullGameFromSearch,
      stopPlayer,
    ]);

  /* =======================================================
     CERRAR JUEGO
  ======================================================= */

  const closeGame =
    useCallback(() => {
      stopPlayer();

      setSearchOpen(
        false
      );

      setFullGame(
        null
      );

      setOpenedGame(
        null
      );
    }, [
      stopPlayer,
    ]);

  /* =======================================================
     CERRAR CONSOLA
  ======================================================= */

  const closeConsole =
    useCallback(() => {
      stopPlayer();

      setOpenedConsole(
        null
      );

      setConsoleGames(
        null
      );

      setFullGame(
        null
      );
    }, [
      stopPlayer,
    ]);

  /* =======================================================
     TECLADO
  ======================================================= */

  useEffect(() => {
    const handleKey = (
      event
    ) => {
      if (
        searchOpen &&
        !fullGame
      ) {
        return;
      }

      /* ESC */

      if (
        event.code ===
        "Escape"
      ) {
        if (
          fullGame
        ) {
          event.preventDefault();
          return;
        }

        if (
          consoleGames
        ) {
          event.preventDefault();

          closeConsoleGames();

          return;
        }

        if (
          openedConsole
        ) {
          event.preventDefault();

          closeConsole();

          return;
        }

        if (
          openedGame
        ) {
          event.preventDefault();

          closeGame();

          return;
        }
      }

      /* E — INTERACTUAR DESKTOP */

      if (
        event.code ===
          "KeyE" &&
        !overlayOpen
      ) {
        if (
          nearbyConsole
        ) {
          event.preventDefault();

          openConsole();

          return;
        }

        if (
          nearbyGame
        ) {
          event.preventDefault();

          openGame();

          return;
        }
      }

      /* F — BUSCAR */

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
          target
            ?.isContentEditable;

        if (
          !editing
        ) {
          event.preventDefault();

          openSearch();

          return;
        }
      }

      /* P — FPS */

      if (
        event.code ===
          "KeyP" &&
        !overlayOpen
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
    nearbyConsole,

    openedGame,
    fullGame,

    openedConsole,
    consoleGames,

    searchOpen,
    overlayOpen,

    openGame,
    openConsole,
    openSearch,

    closeGame,
    closeConsole,
    closeConsoleGames,
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

  if (
    !deviceReady
  ) {
    return null;
  }

  return (
    <>
      <OrientationStabilizer />

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

                      Pellizca para zoom
                      <br />

                      Mantén A para sprint
                      <br />

                      B para interactuar
                    </>
                  ) : (
                    <>
                      WASD para caminar
                      <br />

                      Shift para sprint
                      <br />

                      Arrastra para mirar
                      <br />

                      E para interactuar
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
          BUSCADOR
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
                {
                  stats.fps
                }

                <br />

                Frame:{" "}
                {
                  stats.frameMs
                }
                ms

                <br />

                Draw calls:{" "}
                {
                  stats.calls
                }

                <br />

                Triangles:{" "}
                {
                  stats.triangles
                }

                <br />

                Textures:{" "}
                {
                  stats.textures
                }

                <br />

                Quality:{" "}
                {
                  quality.toUpperCase()
                }

                <div
                  style={{
                    marginTop:
                      10,
                  }}
                >
                  CIELO:{" "}

                  <strong>
                    {
                      skyLabel
                    }
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
          MUNDO
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

          MobileControls ya tiene:
          - cruceta
          - A
          - B

          A se activa según interactionAvailable.
      =================================================== */}

      {!overlayOpen && (
        <MobileControls
          interactionAvailable={
            interactionAvailable
          }
        />
      )}

      {/* ===================================================
          INTERACCIÓN CONSOLA — SOLO ESCRITORIO

          El botón móvil ↗ desaparece.
          En móvil se usa A.
      =================================================== */}

      {nearbyConsole &&
        !overlayOpen &&
        !mobile && (
          <button
            type="button"

            className="world-interaction-button"

            onClick={
              openConsole
            }
          >
            <span className="world-interaction-icon">
              ↗
            </span>

            <span>
              Abrir{" "}
              {
                nearbyConsole.name
              }
            </span>

            <small>
              E
            </small>
          </button>
        )}

      {/* ===================================================
          INTERACCIÓN JUEGO — SOLO ESCRITORIO
      =================================================== */}

      {nearbyGame &&
        !nearbyConsole &&
        !overlayOpen &&
        !isVideoWall &&
        !mobile && (
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
                nearbyGame.title ||
                nearbyGame.name
              }
            </span>

            <small>
              E
            </small>
          </button>
        )}

      {/* ===================================================
          VIDEO WALL

          En móvil también se usa A.
          Botón 2D solamente en escritorio.
      =================================================== */}

      {isVideoWall &&
        !nearbyConsole &&
        !overlayOpen &&
        !mobile && (
          <button
            type="button"

            onClick={
              openGame
            }

            style={{
              position:
                "fixed",

              top:
                64,

              right:
                72,

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

              color:
                "#fff",

              fontSize:
                12,

              fontWeight:
                850,

              cursor:
                "pointer",
            }}
          >
            ↗ Abrir en 2D
          </button>
        )}

      {/* ===================================================
          BUSCADOR
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
          MINI FICHA CONSOLA
      =================================================== */}

      {openedConsole && (
        <div
          style={{
            position:
              "fixed",

            inset:
              0,

            zIndex:
              9000,

            display:
              "flex",

            alignItems:
              "center",

            justifyContent:
              "center",

            padding:
              16,

            boxSizing:
              "border-box",

            background:
              "rgba(0,0,0,.58)",

            backdropFilter:
              "blur(5px)",

            overflow:
              "auto",
          }}

          onClick={
            closeConsole
          }
        >
          <div
            onClick={(
              event
            ) => {
              event.stopPropagation();
            }}
          >
            <ConsoleMiniCard
              consoleData={
                openedConsole
              }

              onClose={
                closeConsole
              }

              onOpenGames={
                openConsoleGames
              }

              onOpenFullCard={
                openFullConsole
              }

              onOpenVideo={
                openConsoleVideo
              }
            />
          </div>
        </div>
      )}

      {/* ===================================================
          CATÁLOGO CONSOLA
      =================================================== */}

      {consoleGames && (
        <PlatformGamesOverlay
          platformId={
            consoleGames.platformId
          }

          platformName={
            consoleGames.name
          }

          onClose={
            closeConsoleGames
          }

          onOpenGame={
            openGameFromConsole
          }

          suspended={
            Boolean(
              fullGame
            )
          }
        />
      )}

      {/* ===================================================
          OVERLAYS
      =================================================== */}

      {fullGame ? (
        <FullGameOverlay
          game={
            fullGame
          }

          onBack={
            backFromFullGame
          }

          onClose={
            closeFullGame
          }
        />
      ) : openedGame?.overlayType ===
        "video" ? (
        <VideoOverlay
          video={
            openedGame
          }

          onClose={
            closeGame
          }
        />
      ) : openedGame ? (
        <RankingOverlay
          game={
            openedGame
          }

          onClose={
            closeGame
          }
        />
      ) : null}
    </>
  );
}
