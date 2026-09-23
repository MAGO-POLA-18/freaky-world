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

/* =========================================================
   FREAKY RANKING
========================================================= */

const FREAKY_RANKING_URL =
  "https://freakyranking.base44.app";

/* =========================================================
   WORLD
========================================================= */

export default function WorldScene() {
  const [
    nearbyGame,
    setNearbyGame,
  ] = useState(
    null
  );

  /* =======================================================
     EVENTO DESDE EL MUNDO 3D
  ======================================================= */

  useEffect(() => {
    const handleGameNear =
      (event) => {
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
     ABRIR FICHA
  ======================================================= */

  const openGame =
    useCallback(() => {
      if (
        !nearbyGame?.id
      ) {
        return;
      }

      playerInput.x = 0;
      playerInput.y = 0;

      playerInput
        .dashRequested =
        false;

      /*
        Al venir de un botón HTML real,
        Safari permite abrir una nueva pestaña.

        Así Freaky World queda abierto
        exactamente donde estaba.
      */

      const url =
        `${FREAKY_RANKING_URL}/game/${nearbyGame.id}`;

      const opened =
        window.open(
          url,
          "_blank"
        );

      /*
        Fallback:
        si Safari bloquea la pestaña,
        navegamos en la misma.
      */

      if (
        !opened
      ) {
        window.location.href =
          url;
      }
    }, [
      nearbyGame,
    ]);

  /* =======================================================
     DESKTOP

     E = abrir ficha
  ======================================================= */

  useEffect(() => {
    const handleKey =
      (event) => {
        if (
          event.code ===
            "KeyE" &&
          nearbyGame
        ) {
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
    openGame,
  ]);

  return (
    <>
      {/* ===================================================
          INSTRUCCIONES
      =================================================== */}

      <div className="instructions">
        WASD para caminar · Shift para sprint · Arrastra para mover la cámara
      </div>

      {/* ===================================================
          MUNDO
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
      =================================================== */}

      <MobileControls />

      {/* ===================================================
          BOTÓN HTML

          ESTE es el mismo principio que
          funcionaba con el ranking ficticio.
      =================================================== */}

      {nearbyGame && (
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
    </>
  );
}
