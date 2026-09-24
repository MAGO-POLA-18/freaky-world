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

  const overlayOpen =
    Boolean(openedGame);

  /* =======================================================
     EVENTO DESDE EL MUNDO 3D
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
     ABRIR FICHA 2D

     NO cambiamos de página.
     NO abrimos pestaña nueva.
     NO desmontamos el mundo 3D.
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

      playerInput.dashRequested =
        false;

      setOpenedGame(null);
    }, []);

  /* =======================================================
     TECLADO

     E = abrir ficha
     ESC = cerrar ficha
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
          INSTRUCCIONES
      =================================================== */}

      {!overlayOpen && (
        <div className="instructions">
          WASD para caminar · Shift para sprint · Arrastra para mover la cámara
        </div>
      )}

      {/* ===================================================
          MUNDO 3D

          El Canvas permanece montado aunque abramos
          una ficha 2D.
      =================================================== */}

      <Canvas
        shadows
        dpr={[
          1,
          1.35,
        ]}
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
          CONTROLES MÓVILES

          Se ocultan mientras está abierta la ficha.
      =================================================== */}

      {!overlayOpen && (
        <MobileControls />
      )}

      {/* ===================================================
          BOTÓN ABRIR FICHA
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
          FICHA 2D SOBRE EL MUNDO
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
